// Frontend logic for connecting to the Baileys Backend

const BACKEND_URL = 'http://localhost:3001';
let socket = null;

// Initialize connection and Socket.IO
function initWhatsAppConnection() {
  if (typeof io === 'undefined') {
    console.error('Socket.IO is not loaded');
    return;
  }

  socket = io(BACKEND_URL);

  socket.on('connect', () => {
    console.log('Connected to WhatsApp backend server');
    checkConnectionStatus();
  });

  socket.on('qr', (qrDataUrl) => {
    console.log('Received QR Code');
    showQRCode(qrDataUrl);
  });

  socket.on('connected', (data) => {
    console.log('WhatsApp connected successfully:', data);
    showConnectedState(data.phone);
  });

  socket.on('disconnected', () => {
    console.log('WhatsApp disconnected');
    showDisconnectedState();
  });
}

async function checkConnectionStatus() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/status`);
    const data = await response.json();
    
    if (data.status === 'connected') {
      showConnectedState(data.phone);
    } else if (data.status === 'disconnected') {
      showDisconnectedState();
    }
    // If status is 'qr', the socket will send the 'qr' event automatically
  } catch (err) {
    console.error('Failed to check WhatsApp status:', err);
  }
}

async function disconnectDevice() {
  if (await confirm('Are you sure you want to disconnect this device?')) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/whatsapp/disconnect`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        showDisconnectedState();
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  }
}

// UI Helpers
function showQRCode(dataUrl) {
  const qrImg = document.getElementById('qr-code-img');
  const qrLoader = document.getElementById('qr-loader');
  
  if (qrImg && qrLoader) {
    qrImg.src = dataUrl;
    qrImg.style.display = 'block';
    qrLoader.style.display = 'none';
  }
  
  document.getElementById('conn-disconnected-ui').style.display = 'block';
  document.getElementById('conn-connected-ui').style.display = 'none';
}

function showConnectedState(phone) {
  document.getElementById('conn-disconnected-ui').style.display = 'none';
  document.getElementById('conn-connected-ui').style.display = 'block';
  
  const phoneSpan = document.querySelector('#conn-connected-ui p span');
  if (phoneSpan && phone) {
    phoneSpan.textContent = '+' + phone;
  }
  
  const statusBadge = document.getElementById('conn-status');
  if (statusBadge) {
    statusBadge.textContent = 'Connected';
    statusBadge.className = 'badge badge-paid';
  }
  
  const banner = document.getElementById('whatsapp-conn-banner');
  if (banner) {
    banner.classList.remove('disconnected');
  }
}

function showDisconnectedState() {
  document.getElementById('conn-disconnected-ui').style.display = 'block';
  document.getElementById('conn-connected-ui').style.display = 'none';
  
  const qrImg = document.getElementById('qr-code-img');
  const qrLoader = document.getElementById('qr-loader');
  
  if (qrImg && qrLoader) {
    qrImg.src = '';
    qrImg.style.display = 'none';
    qrLoader.style.display = 'flex';
  }
  
  const statusBadge = document.getElementById('conn-status');
  if (statusBadge) {
    // If it's already initializing or error, leave it, else set to disconnected
    if (statusBadge.textContent !== 'Initializing...' && statusBadge.textContent !== 'Error Loading') {
      statusBadge.textContent = 'Disconnected';
    }
    statusBadge.className = 'badge badge-unpaid';
  }
  
  const banner = document.getElementById('whatsapp-conn-banner');
  if (banner) {
    banner.classList.add('disconnected');
  }
}

// Global generate function (called by "Refresh QR" button)
window.generateQRCode = function() {
  // Disconnect any lingering sessions to force a new QR
  fetch(`${BACKEND_URL}/api/whatsapp/disconnect`, { method: 'POST' })
    .then(() => {
      // The backend will automatically try to reconnect and emit a new QR
      showDisconnectedState();
      setTimeout(checkConnectionStatus, 1000);
    })
    .catch(err => console.error('Error refreshing QR:', err));
}

window.loadWhatsAppModule = function() {
  if (window.waInitialized) return;
  
  // Show a mini loader on the tab or just let the user know it's connecting
  const statusBadge = document.getElementById('conn-status');
  if (statusBadge && statusBadge.textContent === 'Disconnected') {
    statusBadge.textContent = 'Initializing...';
  }

  // Dynamically load Socket.IO to prevent slowing down the main settings page
  if (typeof io === 'undefined') {
    const script = document.createElement('script');
    // Load directly from our own backend to bypass adblockers and CDN issues
    script.src = `${BACKEND_URL}/socket.io/socket.io.js`;
    script.onload = () => {
      initWhatsAppConnection();
      window.waInitialized = true;
    };
    script.onerror = () => {
      console.error('Failed to load Socket.IO from backend');
      if (statusBadge) statusBadge.textContent = 'Error Loading';
    };
    document.head.appendChild(script);
  } else {
    initWhatsAppConnection();
    window.waInitialized = true;
  }
}

