// ==============================================
// PATH: main.js
// Objetivo: Ponto de entrada do Electron
// - Registra handlers IPC
// - Cria a janela principal com preload
// - Abre o relatório
// ==============================================

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Handlers (modularizados)
const { registrarUsuarioHandlers }   = require("./backend/handlers/usuarioHandler");
const { registerPresencasHandlers }  = require("./backend/handlers/presencasHandler"); // se existir
const { registrarPasseHandlers }     = require("./backend/handlers/passesHandler");

function bootHandlers() {
  try { registrarUsuarioHandlers(ipcMain);  } catch (e) { console.error("Usuarios IPC FAIL:", e); }
  try { registerPresencasHandlers?.(ipcMain); } catch (e) { console.error("Presencas IPC FAIL:", e); }
  try { registrarPasseHandlers?.(ipcMain); } catch (e) { console.error("Passes IPC FAIL:", e); }
}

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.js");
  console.log("🧩 PRELOAD:", preloadPath);

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: preloadPath,
    },
  });

  // Abra a página do RELATÓRIO
  win.loadFile(path.join(__dirname, "frontend", "pages", "relatorio.html"));

  // DevTools em dev
  win.webContents.openDevTools({ mode: "detach" });

  // Log simples pro renderer checar se o preload rodou
  win.webContents.on("did-finish-load", () => {
    console.log("🌐 Renderer carregado.");
  });
}

app.whenReady().then(() => {
  bootHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Torna rejeições visíveis no console em dev
process.on("unhandledRejection", (err) => console.error("UNHANDLED:", err));
