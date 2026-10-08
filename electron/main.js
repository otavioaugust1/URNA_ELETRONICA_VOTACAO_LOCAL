const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');

const PORTA = 3737;
const SRC = path.join(__dirname, '..', 'src');
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

// Mantém referência global para evitar garbage collection
let mainWindow;
let mesarioWindow = null;
let estadoUrna = { ativo: false, travado: false, total: 0, titulo: '' };
const pendentes = new Map();
let seq = 0;
let falhas = 0, bloqueadoAte = 0;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 720,
    minHeight: 560,
    title: 'Urna Eletrônica 🌽',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // visual limpo — sem barra de título nativa no Win
    autoHideMenuBar: true,
    backgroundColor: '#b0b4b8',
  });

  mainWindow.maximize();
  mainWindow.loadFile(path.join(SRC, 'index.html'));

  // Remove menu padrão (File/Edit/View…)
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── Servidor da rede local: painel do mesário em outro PC ──
function enderecos() {
  const out = [];
  for (const lista of Object.values(os.networkInterfaces())) {
    for (const i of lista || []) {
      if (i.family === 'IPv4' && !i.internal) out.push(`http://${i.address}:${PORTA}`);
    }
  }
  return out;
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

function iniciarServidor() {
  const server = http.createServer((req, res) => {
    // arquivos estáticos do painel do mesário (somente os necessários)
    const ARQUIVOS = { '/': 'mesario.html', '/mesario.html': 'mesario.html', '/css/mesario.css': 'css/mesario.css', '/js/mesario.js': 'js/mesario.js' };
    if (req.method === 'GET' && ARQUIVOS[req.url]) {
      const arq = ARQUIVOS[req.url];
      fs.readFile(path.join(SRC, arq), (err, data) => {
        if (err) return json(res, 500, { erro: arq + ' não encontrado' });
        res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq)] });
        res.end(data);
      });
    } else if (req.method === 'GET' && req.url === '/enderecos') {
      json(res, 200, enderecos());
    } else if (req.method === 'GET' && req.url === '/estado') {
      json(res, 200, estadoUrna);
    } else if (req.method === 'POST' && req.url === '/liberar') {
      let corpo = '';
      req.on('data', (c) => { corpo += c; if (corpo.length > 1024) req.destroy(); });
      req.on('end', () => {
        if (Date.now() < bloqueadoAte) {
          return json(res, 429, { ok: false, msg: 'Muitas tentativas. Aguarde alguns segundos.' });
        }
        let senha = '';
        try { senha = String(JSON.parse(corpo).senha || ''); } catch (e) { }
        if (!mainWindow) return json(res, 503, { ok: false, msg: 'Urna indisponível.' });
        const id = ++seq;
        const timer = setTimeout(() => {
          pendentes.delete(id);
          json(res, 504, { ok: false, msg: 'A urna não respondeu.' });
        }, 4000);
        pendentes.set(id, (resp) => {
          clearTimeout(timer);
          if (resp.ok) falhas = 0;
          else if (resp.msg === 'Senha incorreta.' && ++falhas >= 5) { bloqueadoAte = Date.now() + 30000; falhas = 0; }
          json(res, 200, resp);
        });
        mainWindow.webContents.send('urna:liberar', id, senha);
      });
    } else {
      json(res, 404, { erro: 'não encontrado' });
    }
  });
  server.on('error', (e) => console.error('Servidor do mesário:', e.message));
  server.listen(PORTA, '0.0.0.0');
}

ipcMain.on('urna:estado', (_e, estado) => { estadoUrna = estado; });
ipcMain.on('urna:resposta', (_e, id, resp) => {
  const cb = pendentes.get(id);
  if (cb) { pendentes.delete(id); cb(resp); }
});
// Abre o painel do mesário em uma segunda janela (no 2º monitor, se houver)
ipcMain.handle('urna:abrir-mesario', () => {
  if (mesarioWindow && !mesarioWindow.isDestroyed()) { mesarioWindow.focus(); return; }
  const { screen } = require('electron');
  const principal = screen.getDisplayMatching(mainWindow.getBounds());
  const outro = screen.getAllDisplays().find((d) => d.id !== principal.id);
  const area = (outro || principal).workArea;
  mesarioWindow = new BrowserWindow({
    width: 520, height: 700,
    x: area.x + Math.round((area.width - 520) / 2),
    y: area.y + Math.round((area.height - 700) / 2),
    title: 'Painel do Mesário',
    autoHideMenuBar: true,
    backgroundColor: '#ffb74d',
  });
  mesarioWindow.loadURL(`http://127.0.0.1:${PORTA}/`);
  mesarioWindow.on('closed', () => { mesarioWindow = null; });
});
ipcMain.handle('urna:enderecos', () => enderecos());

app.whenReady().then(() => { createWindow(); iniciarServidor(); });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
