// ==============================================
// PATH: main.js
// Objetivo: Ponto de entrada do Electron
// - Cria a janela principal
// - Registra handlers IPC (usuários, presenças, etc.)
// - Abre a página de cadastro para teste
// ==============================================

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
require("dotenv").config();

// Handlers (modular)
const { registrarUsuarioHandlers } = require("./backend/handlers/usuarioHandler");
const { registerPresencasHandlers } = require("./backend/handlers/presencasHandler");
// const { registrarPassesHandlers } = require("./backend/handlers/passesHandler");
// const { registerOutrosHandlers } = require("./backend/handlers/...");

let mainWindow;

/** Cria a janela principal */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 💡 Durante o teste do cadastro, abra a página de cadastro direto.
  // Depois volte para index.html quando quiser.
  mainWindow.loadFile(path.join(__dirname, "frontend", "pages", "cadastro.html"));
  // mainWindow.loadFile(path.join(__dirname, "frontend", "pages", "index.html"));

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // 🔗 Registra IPCs (uma única vez)
  registrarUsuarioHandlers(ipcMain); // << necessário p/ cadastro funcionar
  registerPresencasHandlers(ipcMain);
  // registrarPassesHandlers?.(ipcMain);
  // registerOutrosHandlers?.(ipcMain);

  createWindow();
});

app.on("window-all-closed", () => {
  // No Linux/Windows: encerra app quando todas as janelas fecharem
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  // No macOS: recria janela ao clicar no ícone do dock
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
