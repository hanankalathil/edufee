import express from 'express';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Setup Baileys client
let sock = null;
let qrCodeData = null;
let connectionStatus = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED

const logger = pino({ level: 'warn' });

async function connectToWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('whatsapp_auth_info');
    
    // Fetch latest WhatsApp Web version to avoid 405 Connection Failure
    const { version, isLatest } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307], isLatest: false }));
    console.log(`Using WhatsApp Web v${version.join('.')}, isLatest: ${isLatest}`);

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger
    });
    
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        qrCodeData = qr;
        connectionStatus = 'DISCONNECTED';
      }
      
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('WhatsApp connection closed due to:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect);
        connectionStatus = 'DISCONNECTED';
        qrCodeData = null;
        if (shouldReconnect) {
          setTimeout(connectToWhatsApp, 3000);
        }
      } else if (connection === 'open') {
        console.log('WhatsApp connection opened successfully!');
        connectionStatus = 'CONNECTED';
        qrCodeData = null;
      } else if (connection === 'connecting') {
        connectionStatus = 'CONNECTING';
      }
    });
    
    sock.ev.on('creds.update', saveCreds);
  } catch (error) {
    console.error('Failed to initialize WhatsApp connection:', error);
    connectionStatus = 'DISCONNECTED';
  }
}

// Start connection
connectToWhatsApp();

// API Routes
app.get('/api/whatsapp/status', (req, res) => {
  res.json({ status: connectionStatus });
});

app.get('/api/whatsapp/qr', async (req, res) => {
  if (connectionStatus === 'CONNECTED') {
    return res.status(400).json({ error: 'Already connected' });
  }
  if (!qrCodeData) {
    return res.status(404).json({ error: 'QR Code is generating or not ready yet' });
  }
  try {
    const qrImage = await QRCode.toDataURL(qrCodeData);
    res.json({ qr: qrImage });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code image' });
  }
});

app.post('/api/whatsapp/send', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required' });
  }
  if (connectionStatus !== 'CONNECTED') {
    return res.status(400).json({ error: 'WhatsApp is not connected' });
  }
  
  try {
    // Clean and format phone number: keep only digits
    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.endsWith('@s.whatsapp.net')) {
      cleanPhone = `${cleanPhone}@s.whatsapp.net`;
    }
    
    await sock.sendMessage(cleanPhone, { text: message });
    res.json({ success: true });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message: ' + err.message });
  }
});

app.post('/api/whatsapp/disconnect', async (req, res) => {
  try {
    if (sock) {
      try {
        await sock.logout();
      } catch (err) {
        console.warn('Socket logout error:', err);
      }
    }
    
    // Delete session files
    fs.rmSync('whatsapp_auth_info', { recursive: true, force: true });
    connectionStatus = 'DISCONNECTED';
    qrCodeData = null;
    
    // Restart connection to generate fresh QR
    connectToWhatsApp();
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect session: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`WhatsApp API Server running on port ${PORT}`);
});
