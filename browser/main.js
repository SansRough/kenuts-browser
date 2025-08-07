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
Menu.setApplicationMenu(null);
app.whenReady().then(createWindow);

ipcMain.handle('fetch-kenuts', async (event, address) => {
  return new Promise((resolve, reject) => {
    if (!address.startsWith('kenuts://')) {
      reject('Sadece kenuts:// destekleniyor');
      return;
    }

    const addr = address.replace('kenuts://', '');
    const [host, port] = addr.split(':');
    const client = new net.Socket();
    let dataBuffer = '';

    client.connect(parseInt(port), host, () => {
      const request = "KENUTS GET ZG/1.0\r\nZG-Mode: HTML\r\n\r\n";
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