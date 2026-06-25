const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Mantém referência global para evitar garbage collection
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 720,
    minHeight: 560,
    title: 'Urna Eletrônica 🌽',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // visual limpo — sem barra de título nativa no Win
    autoHideMenuBar: true,
    backgroundColor: '#b0b4b8',
  });

  // Carrega o index.html que fica na raiz do projeto
  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

  // Remove menu padrão (File/Edit/View…)
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
