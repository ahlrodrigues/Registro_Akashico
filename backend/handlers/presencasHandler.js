// backend/handlers/presencasHandler.js
const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const pastaDb = path.join(process.env.HOME || process.env.USERPROFILE, ".seara-de-luz");
if (!fs.existsSync(pastaDb)) {
  fs.mkdirSync(pastaDb, { recursive: true });
}


// Caminho absoluto para o banco de dados
const dbPath = path.join(pastaDb, "database.sqlite");
const db = new Database(dbPath);

// Garante que a tabela exista
db.prepare(`
  CREATE TABLE IF NOT EXISTS presencas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assistido_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    hora TEXT NOT NULL
  );
`).run();

// 📌 Buscar presenças por assistido e mês
ipcMain.handle("presencas:buscar", (event, { assistidoId, ano, mes }) => {
  const mesFormatado = String(mes).padStart(2, '0'); // ex: "07"
  const dataPrefixo = `${ano}-${mesFormatado}`; // ex: "2025-07"

  const stmt = db.prepare(`
    SELECT data, hora
    FROM presencas
    WHERE assistido_id = ?
      AND strftime('%Y-%m', data) = ?
  `);

  const rows = stmt.all(assistidoId, dataPrefixo);
  return rows; // [{ data: "2025-07-11", hora: "19:03" }, ...]
});

// 📌 Adicionar presença
ipcMain.handle("presencas:adicionar", (event, { assistidoId, data }) => {
  const hora = new Date().toTimeString().slice(0, 5); // "HH:MM"

  // Evita duplicatas
  const existe = db.prepare(`
    SELECT COUNT(*) AS total FROM presencas
    WHERE assistido_id = ? AND data = ?
  `).get(assistidoId, data);

  if (existe.total === 0) {
    db.prepare(`
      INSERT INTO presencas (assistido_id, data, hora)
      VALUES (?, ?, ?)
    `).run(assistidoId, data, hora);
  }

  return { sucesso: true };
});

// 📌 Remover presença
ipcMain.handle("presencas:remover", (event, { assistidoId, data }) => {
  db.prepare(`
    DELETE FROM presencas
    WHERE assistido_id = ? AND data = ?
  `).run(assistidoId, data);

  return { sucesso: true };
});
