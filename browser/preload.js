const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer
});

contextBridge.exposeInMainWorld('kenutsAPI', {
  fetchHTML: (url) => ipcRenderer.invoke('fetch-kenuts', url)
});