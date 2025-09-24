// ============================================
// Caminho: backend/handlers/usuarioHandler.js
// Objetivo: Registrar IPCs de Usuários (schema atual, sem "grau")
// Banco: SQLite (better-sqlite3)
// Exporta: registrarUsuarioHandlers(), getDbPath()
// ============================================

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

/** Caminho do DB: ~/.seara-de-luz/database.sqlite (com ponto) */
function getDbPath() {
  const pastaDb = path.join(process.env.HOME || process.env.USERPROFILE, ".seara-de-luz"); // 👈 com ponto
  if (!fs.existsSync(pastaDb)) fs.mkdirSync(pastaDb, { recursive: true });
  return path.join(pastaDb, "database.sqlite");
}

/** Normaliza payload aceitando legado {nome, apelido}. */
function normalizePayload(payload = {}) {
  const nomeCompleto = payload.nomeCompleto ?? payload.nome ?? "";
  const nomeSocial   = payload.nomeSocial   ?? payload.apelido ?? null;

  return {
    id: payload.id ? Number(payload.id) : undefined,
    nomeCompleto,
    nomeSocial,
    dataNascimento: payload.dataNascimento ?? null,
    cep: payload.cep ?? null,
    logradouro: payload.logradouro ?? null,
    numero: payload.numero ?? null,
    bairro: payload.bairro ?? null,
    cidade: payload.cidade ?? null,
    estado: payload.estado ?? null,
    telefone: payload.telefone ?? null,
    email: payload.email ?? null,
    redeSocial: payload.redeSocial ?? null,
    status: payload.status ?? "ativo",
  };
}

/** Registra todos os IPCs de usuários. Chame no main.js. */
function registrarUsuarioHandlers(ipcMain) {
  const dbPath = getDbPath();
  const db = new Database(dbPath);

  // Schema (sem "grau")
  db.prepare(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomeCompleto   TEXT NOT NULL,
      nomeSocial     TEXT,
      dataNascimento TEXT,
      cep            TEXT,
      logradouro     TEXT,
      numero         TEXT,
      bairro         TEXT,
      cidade         TEXT,
      estado         TEXT,
      telefone       TEXT,
      email          TEXT,
      redeSocial     TEXT,
      status         TEXT NOT NULL DEFAULT 'ativo'
    );
  `).run();

  // Statements
  const insertStmt = db.prepare(`
    INSERT INTO usuarios (
      nomeCompleto, nomeSocial, dataNascimento, cep, logradouro, numero,
      bairro, cidade, estado, telefone, email, redeSocial, status
    ) VALUES (
      @nomeCompleto, @nomeSocial, @dataNascimento, @cep, @logradouro, @numero,
      @bairro, @cidade, @estado, @telefone, @email, @redeSocial, @status
    )
  `);

  const updateStmt = db.prepare(`
    UPDATE usuarios SET
      nomeCompleto   = @nomeCompleto,
      nomeSocial     = @nomeSocial,
      dataNascimento = @dataNascimento,
      cep            = @cep,
      logradouro     = @logradouro,
      numero         = @numero,
      bairro         = @bairro,
      cidade         = @cidade,
      estado         = @estado,
      telefone       = @telefone,
      email          = @email,
      redeSocial     = @redeSocial,
      status         = @status
    WHERE id = @id
  `);

  const deleteStmt = db.prepare(`DELETE FROM usuarios WHERE id = ?`);
  const byIdStmt   = db.prepare(`SELECT * FROM usuarios WHERE id = ?`);
  const listStmt   = db.prepare(`
    SELECT
      id,
      nomeCompleto,
      nomeSocial,
      dataNascimento,
      cep,
      logradouro,
      numero,
      bairro,
      cidade,
      estado,
      telefone,
      email,
      redeSocial,
      status
    FROM usuarios
    ORDER BY id ASC
  `);

  // IPCs
  ipcMain.handle("usuario:cadastrar", (e, payload) => {
    const data = normalizePayload(payload);
    const info = insertStmt.run(data);
    return { ok: true, id: info.lastInsertRowid };
  });

  // aceita parâmetro (apenasAtivos), mas aqui ainda não filtra — mantém compat
  ipcMain.handle("usuario:listar", (e/*, apenasAtivos = true */) => listStmt.all());

  ipcMain.handle("usuario:buscarPorId", (e, id) => byIdStmt.get(Number(id)) ?? null);

  ipcMain.handle("usuario:atualizar", (e, payload) => {
    const data = normalizePayload(payload);
    if (!data.id) throw new Error("ID é obrigatório para atualizar.");
    updateStmt.run(data);
    return { ok: true };
  });

  ipcMain.handle("usuario:excluir", (e, id) => {
    deleteStmt.run(Number(id));
    return { ok: true };
  });

  ipcMain.handle("usuario:seed", (e, lista) => {
    if (!Array.isArray(lista)) return { ok: false, erro: "lista inválida" };
    const insert = db.transaction((arr) => {
      for (const item of arr) insertStmt.run(normalizePayload(item));
    });
    insert(lista);
    return { ok: true, total: lista.length };
  });

  console.log("🧩 [USUARIOS] IPCs registrados. DB:", dbPath);
}

module.exports = { registrarUsuarioHandlers, getDbPath };
