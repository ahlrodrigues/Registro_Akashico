// PATH: backend/handlers/passesHandler.js

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

/**
 * Abre/cria o banco e garante a tabela `passes`.
 * Retorna a instância do DB aberta.
 */
function initDb() {
  // 📁 Garante a pasta do banco no home do usuário
  const pastaDb = path.join(process.env.HOME || process.env.USERPROFILE, ".seara-de-luz");
  if (!fs.existsSync(pastaDb)) {
    fs.mkdirSync(pastaDb, { recursive: true });
  }

  // 🗄️ Caminho do arquivo SQLite
  const dbPath = path.join(pastaDb, "database.sqlite");
  const db = new Database(dbPath);

  // 🧱 Criação da tabela de passes (id, assistido, data, hora, tipo)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS passes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assistido_id INTEGER NOT NULL,
      data TEXT NOT NULL,  -- YYYY-MM-DD
      hora TEXT NOT NULL,  -- HH:MM
      tipo TEXT NOT NULL   -- ex.: 'comum'
    )
  `).run();

  return db;
}

/**
 * Utilitário simples para pegar data/hora local (sem libs externas).
 */
function agoraLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return {
    data: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/**
 * Registra todos os canais IPC relacionados a "passes".
 * Chamar UMA VEZ (ex.: em app.whenReady()).
 */
function registrarPasseHandlers(ipcMain) {
  const db = initDb();

  // 🔍 Buscar todos os passes de um assistido
  // req: assistidoId:number
  // resp: Array<{data, hora, tipo}>
  ipcMain.handle("passes:buscarPorAssistido", (event, assistidoId) => {
    const stmt = db.prepare(`
      SELECT data, hora, tipo
      FROM passes
      WHERE assistido_id = ?
      ORDER BY data DESC, hora DESC
    `);
    return stmt.all(assistidoId);
  });

  // 📝 Registrar um novo passe
  // req: { assistidoId:number, tipo?:string, data?:'YYYY-MM-DD', hora?:'HH:MM' }
  // resp: { ok:true, id, data, hora, tipo }
  ipcMain.handle("passes:registrar", (event, payload) => {
    const { assistidoId, tipo = "comum", data, hora } = payload || {};
    if (!assistidoId) throw new Error("assistidoId é obrigatório.");

    const t = (data && hora) ? { data, hora } : agoraLocal();

    const insert = db.prepare(`
      INSERT INTO passes (assistido_id, data, hora, tipo)
      VALUES (?, ?, ?, ?)
    `);
    const info = insert.run(assistidoId, t.data, t.hora, tipo);

    return { ok: true, id: info.lastInsertRowid, data: t.data, hora: t.hora, tipo };
  });

  // 🖨️ Imprimir (simulado) o passe mais recente de cada assistido informado
  // req: ids:number[]
  // resp: { ok:true, impressos: Array<{assistidoId, nome, tipo}> }
  ipcMain.handle("passes:imprimirParaUsuarios", (event, ids) => {
    const lista = Array.isArray(ids) ? ids : [ids];

    const buscarUsuario = db.prepare(`SELECT nomeCompleto FROM usuarios WHERE id = ?`);
    const buscarUltimoPasse = db.prepare(`
      SELECT tipo FROM passes WHERE assistido_id = ? ORDER BY data DESC, hora DESC LIMIT 1
    `);

    const impressos = lista.map((assistidoId) => {
      const usuario = buscarUsuario.get(assistidoId);
      const passe = buscarUltimoPasse.get(assistidoId);
      const nome = usuario?.nomeCompleto ?? `#${assistidoId}`;
      const tipo = passe?.tipo ?? "comum";
      console.log(`🖨️ [simulado] Imprimindo passe de ${nome} — tipo: ${tipo}`);
      return { assistidoId, nome, tipo };
    });

    return { ok: true, impressos };
  });
}

module.exports = { registrarPasseHandlers };
