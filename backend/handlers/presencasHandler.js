// ==============================================
// PATH: backend/handlers/presencasHandler.js
// ==============================================

/**
 * Handler de Presenças
 * - CRUD e consulta por mês para o calendário.
 * - Usa better-sqlite3 no processo principal.
 * - IPC expostos: presencas:buscar, presencas:adicionar, presencas:remover.
 * - Evita duplicatas com UNIQUE(assistido_id, data).
 */

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// 🗂 Pasta do banco no HOME do usuário
const pastaDb = path.join(process.env.HOME || process.env.USERPROFILE, ".seara-de-luz");
if (!fs.existsSync(pastaDb)) {
  fs.mkdirSync(pastaDb, { recursive: true });
}

// 🧱 Caminho absoluto do banco
const dbPath = path.join(pastaDb, "database.sqlite");

// 🔌 Abre conexão (uma única instância por processo)
const db = new Database(dbPath);

// ⚙️ Pragmas recomendados
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

// 🧮 Tabela + índices
db.prepare(`
  CREATE TABLE IF NOT EXISTS presencas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assistido_id INTEGER NOT NULL,
    data TEXT NOT NULL,    -- ISO "YYYY-MM-DD"
    hora TEXT NOT NULL,    -- "HH:MM"
    CONSTRAINT uq_assistido_data UNIQUE (assistido_id, data)
  );
`).run();

db.prepare(`
  CREATE INDEX IF NOT EXISTS idx_presencas_assistido_data
  ON presencas (assistido_id, data);
`).run();

// ✅ Prepared statements
const stmtBuscarPorPrefixo = db.prepare(`
  SELECT data, hora
  FROM presencas
  WHERE assistido_id = ?
    AND substr(data, 1, 7) = ?   -- "YYYY-MM"
  ORDER BY data DESC, hora DESC
`);

const stmtExisteNoDia = db.prepare(`
  SELECT COUNT(*) AS total
  FROM presencas
  WHERE assistido_id = ? AND data = ?
`);

const stmtInserir = db.prepare(`
  INSERT OR IGNORE INTO presencas (assistido_id, data, hora)
  VALUES (?, ?, ?)
`);

const stmtRemover = db.prepare(`
  DELETE FROM presencas
  WHERE assistido_id = ? AND data = ?
`);

// 🔒 Validações simples
function validarId(id) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("assistidoId inválido.");
}
function validarDataISO(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error("data inválida (use YYYY-MM-DD).");
}
function validarAnoMes(ano, mes) {
  if (!Number.isInteger(ano) || ano < 1900 || ano > 9999) throw new Error("ano inválido.");
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) throw new Error("mês inválido.");
}

/**
 * Registra os handlers de IPC (chamar no main.js)
 * @param {import('electron').IpcMain} ipcMain
 */
function registerPresencasHandlers(ipcMain) {
  // 📌 Buscar presenças por assistido e mês
  ipcMain.handle("presencas:buscar", (event, payload) => {
    try {
      const { assistidoId, ano, mes } = payload || {};
      validarId(assistidoId);
      validarAnoMes(ano, mes);

      const mesFormatado = String(mes).padStart(2, "0"); // "07"
      const prefixo = `${ano}-${mesFormatado}`;          // "2025-07"

      const rows = stmtBuscarPorPrefixo.all(assistidoId, prefixo);
      return { sucesso: true, dados: rows };             // [{data, hora}, ...]
    } catch (err) {
      console.error("❌ presencas:buscar:", err);
      return { sucesso: false, erro: String(err.message || err) };
    }
  });

  // ➕ Adicionar presença
  ipcMain.handle("presencas:adicionar", (event, payload) => {
    try {
      const { assistidoId, data } = payload || {};
      validarId(assistidoId);
      validarDataISO(data);

      const hora = new Date().toTimeString().slice(0, 5); // "HH:MM"

      const existe = stmtExisteNoDia.get(assistidoId, data);
      if ((existe?.total ?? 0) === 0) {
        stmtInserir.run(assistidoId, data, hora);
      }

      return { sucesso: true, dados: { assistidoId, data, hora } };
    } catch (err) {
      console.error("❌ presencas:adicionar:", err);
      return { sucesso: false, erro: String(err.message || err) };
    }
  });

  // 🗑️ Remover presença
  ipcMain.handle("presencas:remover", (event, payload) => {
    try {
      const { assistidoId, data } = payload || {};
      validarId(assistidoId);
      validarDataISO(data);

      stmtRemover.run(assistidoId, data);
      return { sucesso: true };
    } catch (err) {
      console.error("❌ presencas:remover:", err);
      return { sucesso: false, erro: String(err.message || err) };
    }
  });
}

module.exports = {
  registerPresencasHandlers,
};
