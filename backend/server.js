const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const qrcode = require('qrcode');

// Prevent Baileys from crashing the server on internal errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason 
} = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve frontend statically
const path = require('path');
app.use('/pages', express.static(path.join(__dirname, '../frontend/pages')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

const PORT = 3001;

let sock = null;
let connectionStatus = 'disconnected';
let qrData = null;
let userPhone = null;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./.auth_info');
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }) // Suppress excessive logging
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('New QR code received');
      qrData = qr;
      connectionStatus = 'qr';
      // Generate Base64 Data URL for the QR code
      const qrImageUrl = await qrcode.toDataURL(qr);
      io.emit('qr', qrImageUrl);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
      connectionStatus = 'disconnected';
      qrData = null;
      userPhone = null;
      io.emit('disconnected');
      
      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        // Logged out or invalid tokens (401). Clear auth and restart to get a new QR code.
        console.log('Session is invalid or logged out. Clearing auth and regenerating QR code...');
        try {
          fs.rmSync('./.auth_info', { recursive: true, force: true });
        } catch (err) {}
        setTimeout(() => {
          connectToWhatsApp();
        }, 1000);
      }
    } else if (connection === 'open') {
      console.log('Opened connection');
      connectionStatus = 'connected';
      qrData = null;
      
      // Get the connected user's phone number
      const jid = sock.user.id;
      userPhone = jid.split(':')[0]; // format is number:device@s.whatsapp.net
      
      io.emit('connected', { phone: userPhone });
    }
  });
}

// REST APIs
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    status: connectionStatus,
    phone: userPhone
  });
});

const fs = require('fs');

app.post('/api/whatsapp/disconnect', async (req, res) => {
  connectionStatus = 'disconnected';
  qrData = null;
  userPhone = null;

  if (sock) {
    try {
      await sock.logout();
      // 'close' event handler will take care of restarting
    } catch(e) {
      try { fs.rmSync('./.auth_info', { recursive: true, force: true }); } catch (err) {}
      setTimeout(() => {
        connectToWhatsApp();
      }, 1000);
    }
    res.json({ success: true, message: 'Disconnected and restarting' });
  } else {
    try { fs.rmSync('./.auth_info', { recursive: true, force: true }); } catch (err) {}
    setTimeout(() => {
      connectToWhatsApp();
    }, 1000);
    res.json({ success: true, message: 'Not connected, restarting' });
  }
});

app.post('/api/whatsapp/send', async (req, res) => {
  if (connectionStatus !== 'connected' || !sock) {
    return res.status(400).json({ success: false, error: 'WhatsApp not connected' });
  }

  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'Phone and message are required' });
  }

  try {
    // Format phone number to JID (Add country code if missing, but we assume it's passed correctly)
    // Remove any +, spaces, or dashes
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const jid = `${cleanPhone}@s.whatsapp.net`;
    
    await sock.sendMessage(jid, { text: message });
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

io.on('connection', (socket) => {
  console.log('Frontend connected via WebSocket');
  // Send current state to new connection
  if (connectionStatus === 'qr' && qrData) {
    qrcode.toDataURL(qrData).then(url => {
      socket.emit('qr', url);
    });
  } else if (connectionStatus === 'connected') {
    socket.emit('connected', { phone: userPhone });
  }
});

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  connectToWhatsApp();
  
  // Automatically open the browser
  const { exec } = require('child_process');
  const url = 'http://localhost:3001/pages/login.html';
  
  // Platform specific command to open browser
  const startCommand = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCommand} ${url}`);
});

// Setup Monthly Fee Cron Job
const cron = require('node-cron');
const { getDb, saveDb } = require('./db');

// Run at 00:00 on day-of-month 1
cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly fee generation job...');
  try {
    const db = await getDb();
    
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let feesIssued = 0;
    
    db.students.forEach(student => {
      const batch = db.batches.find(b => b.name === student.batch);
      if (batch && batch.price) {
        const price = parseFloat(batch.price);
        
        // Check if fee for this month already exists for this student
        const exists = db.fees.find(f => f.studentId === student._id && f.feeType === 'Monthly Tuition' && f.billingPeriod === currentMonth);
        
        if (!exists) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 10); // Due in 10 days
          
          db.fees.push({
            _id: 'fee_' + Date.now() + '_' + Math.floor(Math.random() * 1000000),
            studentId: student._id,
            feeType: 'Monthly Tuition',
            billingPeriod: currentMonth,
            totalAmount: price,
            discount: 0,
            fine: 0,
            netAmount: price,
            paidAmount: 0,
            dueAmount: price,
            status: 'Unpaid',
            dueDate: dueDate.toISOString(),
            paymentHistory: []
          });
          feesIssued++;
        }
      }
    });
    
    if (feesIssued > 0) {
      await saveDb();
      console.log(`Successfully issued ${feesIssued} monthly fees for ${currentMonth}.`);
    } else {
      console.log(`No new monthly fees to issue for ${currentMonth}.`);
    }
  } catch (err) {
    console.error('Error generating monthly fees:', err);
  }
});
