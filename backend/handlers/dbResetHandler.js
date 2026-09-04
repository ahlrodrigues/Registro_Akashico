// ============================================
// PATH: backend/handlers/dbResetHandler.js
// OBJ:  IPC para resetar o banco SQLite (apagar arquivo e recriar schema)
// PADRÕES:
// - CommonJS
// - Opera sobre o MESMO arquivo usado pelos handlers (database.sqlite)
// - Opcional: seed de desenvolvimento
// ============================================

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const { getDbPath, CREATE_USUARIOS_SQL } = require("./usuarioHandler");

/** Garante que a pasta do arquivo existe */
function ensureDirFor(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const insertUsuarioSql = `
  INSERT INTO usuarios (
    nomeCompleto, nomeSocial, dataNascimento, cep, logradouro, numero,
    bairro, cidade, estado, telefone, email, redeSocial, status
  ) VALUES (
    @nomeCompleto, @nomeSocial, @dataNascimento, @cep, @logradouro, @numero,
    @bairro, @cidade, @estado, @telefone, @email, @redeSocial, @status
  )
`;

const usuariosSeed = [
  {
    nomeCompleto: "João da Luz", nomeSocial: "João", dataNascimento: "1980-01-01",
    cep: "00000-000", logradouro: "Rua Luz", numero: "1", bairro: "Centro",
    cidade: "Cidade", estado: "SP", telefone: "1111-1111", email: "joao@email.com",
    redeSocial: null, status: "ativo",
  },
  {
    nomeCompleto: "Maria Esperança", nomeSocial: "Maria", dataNascimento: "1985-02-02",
    cep: "00000-000", logradouro: "Av Esperança", numero: "2", bairro: "Centro",
    cidade: "Cidade", estado: "SP", telefone: "2222-2222", email: "maria@email.com",
    redeSocial: null, status: "ativo",
  },
];

/**
 * Reseta o banco:
 * - apaga o arquivo database.sqlite (se existir)
 * - recria a tabela `usuarios`
 * - (opcional) aplica seed com 2 usuários
 * @param {{ seed?: boolean }} opts
 */
async function resetDatabase(opts = {}) {
  const { seed = false } = opts;
  const dbPath = getDbPath();

  ensureDirFor(dbPath);

  try {
    if (fs.existsSync(dbPath)) {
      fs.rmSync(dbPath, { force: true });
      console.log("[db:reset] arquivo removido:", dbPath);
    } else {
      console.log("[db:reset] arquivo não existia:", dbPath);
    }
  } catch (err) {
    console.error("[db:reset] falha ao remover arquivo:", err);
    throw err;
  }

  const db = new Database(dbPath);
  try {
    db.prepare(CREATE_USUARIOS_SQL).run();

    if (seed) {
      const insert = db.prepare(insertUsuarioSql);
      const inserirTodos = db.transaction((lista) => {
        for (const usuario of lista) insert.run(usuario);
      });
      inserirTodos(usuariosSeed);
      console.log("[db:reset] seed aplicado.");
    }
  } finally {
    db.close();
  }

  return { ok: true, dbPath, seeded: !!seed };
}

/**
 * Registra o IPC no processo principal.
 * Canal: "db:reset" (invoke)
 */
function registrarDbResetHandler(ipcMain) {
  ipcMain.handle("db:reset", async (_event, opts) => {
    return resetDatabase(opts || {});
  });
}

module.exports = {
  registrarDbResetHandler,
  resetDatabase,
};
