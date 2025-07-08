function registrarLoginHandler(ipcMain) {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.join(__dirname, '../db/usuarios.db');

  ipcMain.handle('usuario:login', async (_, email, whatsapp) => {
    const db = new sqlite3.Database(dbPath);
    return new Promise((resolve) => {
      db.get("SELECT * FROM usuarios WHERE email = ? AND whatsapp = ?", [email, whatsapp], (err, row) => {
        db.close();
        if (err || !row) return resolve(null);
        resolve(row);
      });
    });
  });
}

module.exports = { registrarLoginHandler };