const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const http = require('http')
const { spawn } = require('child_process')

app.setName('Sewing Box Launcher')

let win

function createLauncher() {
  win = new BrowserWindow({
    width: 560,
    height: 420,
    resizable: false,
    title: 'Sewing Box — Launcher',
    icon: path.join(__dirname, '..', 'sewing.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'launcher-preload.js'),
    },
  })

  win.setMenuBarVisibility(false)
  win.loadFile(path.join(__dirname, 'launcher-ui.html'))
}

function waitForServer(url, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs
    function check() {
      http.get(url, () => resolve()).on('error', () => {
        if (Date.now() > deadline) reject(new Error('Timeout — serveur non disponible'))
        else setTimeout(check, 1500)
      })
    }
    check()
  })
}

async function launchNormal(appRoot) {
  const env = {
    ...process.env,
    APP_PORT: '5000',
    USER_DATA_PATH: path.join(appRoot, 'backend', 'data'),
    PDF_DIR: path.join(appRoot, 'backend', 'pdfs'),
  }

  // Démarre le backend
  spawn('node', [path.join(appRoot, 'backend', 'server.js')], {
    cwd: appRoot, detached: true, stdio: 'ignore', env,
  }).unref()

  // Démarre le serveur React dev
  spawn('npm', ['start', '--prefix', 'frontend'], {
    cwd: appRoot, detached: true, stdio: 'ignore', env, shell: true,
  }).unref()

  // Attend que le serveur React soit prêt
  await waitForServer('http://localhost:3000')

  // Lance Electron en mode dev (hot reload actif)
  spawn(process.execPath, [appRoot], {
    detached: true, stdio: 'ignore',
    env: { ...env, ELECTRON_DEV: 'true' },
  }).unref()
}

function launchTest(appRoot) {
  const appDataBase = app.getPath('appData')
  const testUserDataPath = path.join(appDataBase, 'Sewing Box-test')

  spawn(process.execPath, [appRoot, `--user-data-dir=${testUserDataPath}`], {
    detached: true, stdio: 'ignore',
    env: { ...process.env, APP_PORT: '5001' },
  }).unref()
}

ipcMain.on('launch', async (event, mode) => {
  const appRoot = path.join(__dirname, '..')
  try {
    if (mode === 'normal') {
      event.reply('status', { mode, ok: true, loading: true, message: 'Démarrage du serveur React…' })
      await launchNormal(appRoot)
      event.reply('status', { mode, ok: true, loading: false, message: 'Instance lancée avec vos données (port 5000)' })
    } else {
      launchTest(appRoot)
      event.reply('status', { mode, ok: true, loading: false, message: 'Instance TEST lancée (données vides, port 5001)' })
    }
  } catch (err) {
    event.reply('status', { mode, ok: false, loading: false, message: `Erreur : ${err.message}` })
  }
})

app.whenReady().then(createLauncher)
app.on('window-all-closed', () => app.quit())
