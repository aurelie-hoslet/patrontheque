const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const http = require('http')

const isDev = process.env.ELECTRON_DEV === 'true'
const PORT = 5000

let mainWindow

function waitForServer(url, retries, delay, callback) {
  http.get(url, () => callback()).on('error', () => {
    if (retries <= 0) { callback(new Error('Serveur non disponible')); return }
    setTimeout(() => waitForServer(url, retries - 1, delay, callback), delay)
  })
}

function startBackend() {
  process.env.USER_DATA_PATH = app.getPath('userData')
  if (!isDev) process.env.NODE_ENV = 'production'
  require(path.join(__dirname, '../backend/server.js'))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Sewing Box',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.setMenuBarVisibility(false)

  const devUrl = 'http://localhost:3000'
  const prodUrl = `http://localhost:${PORT}`
  const loadUrl = isDev ? devUrl : prodUrl

  waitForServer(loadUrl, 20, 500, (err) => {
    if (err) {
      console.error('Impossible de joindre le serveur:', err.message)
    }
    mainWindow.loadURL(loadUrl)
  })

  // Ouvrir les liens externes dans le navigateur système
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  startBackend()
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
