// ============================================
// Caminho: backend/handlers/loginHandler.js
// Objetivo: Identificar um assistido pelo e-mail + telefone no banco ativo
// Banco: mesmo arquivo usado por usuarioHandler.js (~/.seara-de-luz/database.sqlite)
// ============================================

const Database = require("better-sqlite3");
const { getDbPath } = require("./usuarioHandler");

function registrarLoginHandler(ipcMain) {
  ipcMain.handle("usuario:login", async (_event, email, telefone) => {
    const db = new Database(getDbPath());
    try {
      const usuario = db
        .prepare(`SELECT * FROM usuarios WHERE email = ? AND telefone = ?`)
        .get(email, telefone);
      return usuario ?? null;
    } finally {
      db.close();
    }
  });
}

module.exports = { registrarLoginHandler };
