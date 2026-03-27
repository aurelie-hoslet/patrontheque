const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

// Empêche l'app launcher de créer son propre dossier userData dans AppData
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

function launchApp(mode) {
  const appRoot = path.join(__dirname, '..')
  const electronBin = process.execPath

  // userData de l'instance normale = AppData\Roaming\Sewing Box (défaut)
  // userData de l'instance test   = AppData\Roaming\Sewing Box-test
  const appDataBase = app.getPath('appData')
  const testUserDataPath = path.join(appDataBase, 'Sewing Box-test')

  const normalUserDataPath = path.join(appDataBase, 'Sewing Box')

  const args = [appRoot]
  const env = { ...process.env }

  if (mode === 'test') {
    args.push(`--user-data-dir=${testUserDataPath}`)
    env.APP_PORT = '5001'
  } else {
    args.push(`--user-data-dir=${normalUserDataPath}`)
    env.APP_PORT = '5000'
    env.USER_DATA_PATH = path.join(appRoot, 'backend', 'data')
    env.PDF_DIR = path.join(appRoot, 'backend', 'pdfs')
  }

  const child = spawn(electronBin, args, {
    detached: true,
    stdio: 'ignore',
    env,
  })
  child.unref()

  return testUserDataPath
}

ipcMain.on('launch', (event, mode) => {
  try {
    const testPath = launchApp(mode)
    const label = mode === 'test'
      ? `Instance TEST lancée (données dans "Sewing Box-test", port 5001)`
      : `Instance normale lancée (vos données, port 5000)`

    event.reply('status', { mode, ok: true, message: label })
  } catch (err) {
    event.reply('status', { mode, ok: false, message: `Erreur : ${err.message}` })
  }
})

app.whenReady().then(createLauncher)

app.on('window-all-closed', () => app.quit())
