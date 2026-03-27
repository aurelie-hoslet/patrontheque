const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('launcher', {
  launch: (mode) => ipcRenderer.send('launch', mode),
  onStatus: (callback) => ipcRenderer.on('status', (_event, msg) => callback(msg)),
})
