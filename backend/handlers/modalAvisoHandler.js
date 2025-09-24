// ============================================
// PATH: backend/handlers/modalAvisoHandler.js
// OBJ:  Handler central para avisos do renderer via IPC (invoke)
// PADRÕES:
// - CommonJS
// - Função de registro isolada
// - Aceita string ou { tipo, mensagem }
// - Pronto para trocar dialog nativo por modal custom (via webContents.send)
// ============================================

const { dialog, BrowserWindow } = require("electron");

/**
 * Normaliza o payload aceitando string ou objeto.
 * @param {string|{tipo?:string,mensagem?:string}} payload
 */
function normalizarPayload(payload) {
  if (typeof payload === "string") return { tipo: "info", mensagem: payload };
  const p = payload || {};
  return {
    tipo: (p.tipo || "info").toLowerCase(),
    mensagem: p.mensagem || "Mensagem",
  };
}

/**
 * Exibe aviso usando diálogo nativo do sistema.
 * Troque por webContents.send se quiser modal visual custom.
 * @param {BrowserWindow|null} win
 * @param {{tipo:string,mensagem:string}} data
 */
async function exibirAvisoNativo(win, data) {
  const typeMap = { ok: "info", info: "info", warn: "warning", erro: "error", error: "error" };
  const type = typeMap[data.tipo] || "info";
  await dialog.showMessageBox(win || BrowserWindow.getFocusedWindow(), {
    type,
    title: "Registro Akashico",
    message: data.mensagem,
    buttons: ["OK"],
    noLink: true,
    defaultId: 0,
  });
}

/**
 * (Opcional) Envia evento para um modal visual do renderer.
 * Use esta função se preferir o modal custom ao invés do diálogo nativo.
 * @param {BrowserWindow} win
 * @param {{tipo:string,mensagem:string}} data
 */
function enviarAvisoParaRenderer(win, data) {
  if (!win || win.isDestroyed()) return;
  win.webContents.send("ui:modal-aviso", data);
}

/**
 * Registra o handler 'modal:aviso' (ipcMain.handle).
 * @param {import('electron').IpcMain} ipcMain
 * @param {BrowserWindow} mainWindow
 * @param {{usarDialogNativo?: boolean}} [opts]
 */
function registrarModalAvisoHandler(ipcMain, mainWindow, opts = { usarDialogNativo: true }) {
  ipcMain.handle("modal:aviso", async (_event, payload) => {
    const data = normalizarPayload(payload);
    if (opts.usarDialogNativo) {
      await exibirAvisoNativo(mainWindow, data);
    } else {
      enviarAvisoParaRenderer(mainWindow, data);
    }
    return true;
  });
}

module.exports = {
  registrarModalAvisoHandler,
  enviarAvisoParaRenderer, // exportado caso queira disparar avisos do próprio main
};
