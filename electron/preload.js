const { contextBridge, ipcRenderer } = require('electron');

// Ponte segura entre a urna (index.html) e o servidor de rede do processo principal
contextBridge.exposeInMainWorld('urnaAPI', {
  enviarEstado: (estado) => ipcRenderer.send('urna:estado', estado),
  onLiberar: (cb) => ipcRenderer.on('urna:liberar', (_e, id, senha) => cb(id, senha)),
  responder: (id, resp) => ipcRenderer.send('urna:resposta', id, resp),
  abrirMesario: () => ipcRenderer.invoke('urna:abrir-mesario'),
  enderecos: () => ipcRenderer.invoke('urna:enderecos'),
});
