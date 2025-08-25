const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const net = require('net');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    //frame: false,
    webPreferences: {
      preload: __dirname + '/preload.js',
      contextIsolation: true,
      nodeIntegration: false,
    }
  });
  win.maximize()
  win.loadFile('index.html');
}
//Menu.setApplicationMenu(null);
app.whenReady().then(createWindow);

ipcMain.handle('fetch-kenuts', async (event, address) => {
  return new Promise((resolve, reject) => {
    if (!address.startsWith('kenuts://')) {
      reject('Sadece kenuts:// destekleniyor');
      return;
    }

    // Parse full URL to extract host, port, and path
    const url = new URL(address);
    const host = url.hostname;
    const port = url.port ? parseInt(url.port, 10) : 6969;
    const path = url.pathname || '/';
    
    // Validate port
    if (isNaN(port) || port <= 0 || port >= 65536) {
      reject(`Geçersiz port numarası: ${url.port}`);
      return;
    }
    
    if (!host || host.trim() === '') {
      reject('Geçersiz host adresi');
      return;
    }
    
    const client = new net.Socket();
    let dataBuffer = '';

    client.connect(port, host.trim(), () => {
      // Include the path in the request
      const request = `KENUTS GET ${path} ZG/1.0\r\nZG-Mode: HTML\r\n\r\n`;
      console.log('Sending request:', request.replace(/\r\n/g, '\\r\\n'));
      client.write(request);
    });

    client.on('data', chunk => {
      dataBuffer += chunk.toString();
    });

    client.on('close', () => {
      // connection kapandıktan sonra çözümle
      const parts = dataBuffer.split('\r\n\r\n');
      if (parts.length < 2) {
        resolve('Geçersiz yanıt');
      } else {
        resolve(parts.slice(1).join('\r\n\r\n')); // body
      }
    });

    client.on('error', err => {
      reject('Bağlantı hatası: ' + err.message);
    });
  });
});