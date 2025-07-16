// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();
const { atualizarStatusAutomaticamente } = require('./backend/handlers/statusHandler');


let mainWindow;

/**
 * Cria a janela principal da aplicação
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true, 
      preload: path.join(__dirname, 'preload.js'), 
    },
  });

  // Carrega o arquivo HTML principal
  mainWindow.loadFile(path.join(__dirname, 'frontend', 'pages', 'index.html'));

// 🔧 Abre DevTools automaticamente
  mainWindow.webContents.openDevTools();
}

/**
 * Evento disparado quando o Electron estiver pronto
 */

app.whenReady().then(() => {
  createWindow();

  // ⏱️ Atualiza status dos assistidos com ausência > 90 dias
  atualizarStatusAutomaticamente()
    .then(() => console.log('✅ Verificação de status finalizada.'))
    .catch(err => console.error('❌ Falha ao atualizar status:', err));
});

/**
 * Fecha o app quando todas as janelas forem fechadas (exceto no macOS)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/**
 * Ativa a criação da janela novamente no macOS ao clicar no dock
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/**
 * 🔌 Registro de handlers (modularizado)
 */
const { registrarAssistidosHandlers } = require('./backend/handlers/assistidosHandler');
registrarAssistidosHandlers(ipcMain);

const {
  criarTabelaUsuarios,
  registrarUsuarioHandlers
} = require('./backend/handlers/usuarioHandler');

criarTabelaUsuarios().then(() => {
  registrarUsuarioHandlers(ipcMain);
});

const { registrarLoginHandler } = require('./backend/handlers/loginHandler');
registrarLoginHandler(ipcMain);

const { registrarPasseHandler } = require('./backend/handlers/passesHandlers');
registrarPasseHandler(ipcMain);

require('./backend/handlers/presencasHandler.js');





