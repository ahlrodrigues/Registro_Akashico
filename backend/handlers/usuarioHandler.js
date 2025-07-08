// usuarioHandler.js (CommonJS)
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');

// Caminho do banco de dados
const baseDir = process.env.APPDATA || process.env.HOME || path.resolve(__dirname, '..', '..', 'dados');
const dbDir = path.join(baseDir, 'seara-de-luz');
const dbPath = path.join(dbDir, 'usuarios.db');

// Cria a pasta se não existir
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}


// Abre a conexão com SQLite
async function abrirBanco() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

// Cria a tabela, se não existir
async function criarTabelaUsuarios() {
  const db = await abrirBanco();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      apelido TEXT,
      grau TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      status TEXT DEFAULT 'ativo'
    )
  `);
}

// Insere novo usuário
async function salvarUsuario(usuario) {
  const db = await abrirBanco();
  await db.run(`
    INSERT INTO usuarios (nome, apelido, grau, telefone, email, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    usuario.nome,
    usuario.apelido,
    usuario.grau,
    usuario.telefone,
    usuario.email,
    usuario.status || 'ativo'
  ]);
}

// Atualiza um usuário existente
async function atualizarUsuario(usuario) {
  const db = await abrirBanco();
  await db.run(`
    UPDATE usuarios
    SET nome = ?, apelido = ?, grau = ?, telefone = ?, email = ?, status = ?
    WHERE id = ?
  `, [
    usuario.nome,
    usuario.apelido,
    usuario.grau,
    usuario.telefone,
    usuario.email,
    usuario.status || 'ativo',
    usuario.id
  ]);
}
console.log('🗂️ Usando banco em:', dbPath);

// Lista todos os usuários (ativos por padrão)
async function listarUsuarios(soAtivos = true) {
  const db = await abrirBanco();
  const where = soAtivos ? `WHERE status = 'ativo'` : '';
  return db.all(`SELECT * FROM usuarios ${where} ORDER BY id ASC`);
}

// Busca usuário por ID
async function buscarUsuarioPorId(id) {
  const db = await abrirBanco();
  return db.get(`SELECT * FROM usuarios WHERE id = ?`, [id]);
}

// Remove usuário
async function excluirUsuario(id) {
  const db = await abrirBanco();
  await db.run(`DELETE FROM usuarios WHERE id = ?`, [id]);
}

function registrarUsuarioHandlers(ipcMain) {
  ipcMain.handle('usuario:cadastrar', async (event, dados) => {
    return salvarUsuario(dados);
  });

  ipcMain.handle('usuario:listar', async () => {
    return listarUsuarios(true); // apenas ativos
  });

  ipcMain.handle('usuario:buscarPorId', async (event, id) => {
    return buscarUsuarioPorId(id);
  });

  ipcMain.handle('usuario:atualizar', async (event, usuario) => {
    return atualizarUsuario(usuario);
  });

  ipcMain.handle('usuario:excluir', async (event, id) => {
    return excluirUsuario(id);
  });
}

// Exporta tudo
module.exports = {
  abrirBanco,
  criarTabelaUsuarios,
  salvarUsuario,
  atualizarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  excluirUsuario,
  registrarUsuarioHandlers
};

