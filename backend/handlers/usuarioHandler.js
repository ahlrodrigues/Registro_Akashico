// ============================================
// Caminho: backend/handlers/usuarioHandler.js
// Objetivo: CRUD de usuários (novo modelo de cadastro)
// Banco: SQLite (sqlite + sqlite3)
// Notas:
// - Schema atualizado p/ campos: nomeCompleto, nomeSocial, dataNascimento,
//   cep, logradouro, numero, bairro, cidade, estado, telefone, email, redeSocial, status
// - Migração leve: adiciona colunas que faltarem em bases antigas
// - IPCs: usuario:cadastrar | listar | buscarPorId | atualizar | excluir
// ============================================

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');

// ------------------------------
// Caminhos (pasta de dados)
// ------------------------------
const baseDir =
  process.env.APPDATA ||
  process.env.HOME ||
  path.resolve(__dirname, '..', '..', 'dados');

const dbDir = path.join(baseDir, 'seara-de-luz');
const dbPath = path.join(dbDir, 'usuarios.db');

// Garante a pasta do DB
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('🗂️ Usando banco em:', dbPath);

// ------------------------------
// Abertura do banco
// ------------------------------
async function abrirBanco() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

// ------------------------------
// Criar tabela (novo schema)
// ------------------------------
async function criarTabelaUsuarios() {
  const db = await abrirBanco();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      -- Identificação
      nomeCompleto TEXT NOT NULL,
      nomeSocial   TEXT,
      dataNascimento TEXT NOT NULL, -- formato ISO yyyy-mm-dd

      -- Endereço
      cep        TEXT NOT NULL,  -- "00000-000"
      logradouro TEXT NOT NULL,  -- rua/av
      numero     TEXT NOT NULL,
      bairro     TEXT NOT NULL,
      cidade     TEXT NOT NULL,
      estado     TEXT NOT NULL,  -- UF

      -- Contatos
      telefone   TEXT,
      email      TEXT,
      redeSocial TEXT,

      -- Status
      status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','desativado'))
    );
  `);

  // Índice simples para busca por nome
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_usuarios_nome ON usuarios (nomeCompleto);`);
}

// ------------------------------
// Migração leve (adiciona colunas que faltarem)
// Obs.: mantém compatibilidade com bases antigas (ex.: nome, apelido, grau etc.)
// ------------------------------
async function migrarSchemaSeNecessario() {
  const db = await abrirBanco();
  const cols = await db.all(`PRAGMA table_info(usuarios);`);
  if (!cols || cols.length === 0) {
    // Tabela não existia: cria do zero
    await criarTabelaUsuarios();
    return;
  }

  const tem = (nome) => cols.some(c => c.name === nome);

  // Lista do novo schema
  const colunasNovas = [
    { name: 'nomeCompleto',   ddl: `ALTER TABLE usuarios ADD COLUMN nomeCompleto TEXT;` },
    { name: 'nomeSocial',     ddl: `ALTER TABLE usuarios ADD COLUMN nomeSocial TEXT;` },
    { name: 'dataNascimento', ddl: `ALTER TABLE usuarios ADD COLUMN dataNascimento TEXT;` },
    { name: 'cep',            ddl: `ALTER TABLE usuarios ADD COLUMN cep TEXT;` },
    { name: 'logradouro',     ddl: `ALTER TABLE usuarios ADD COLUMN logradouro TEXT;` },
    { name: 'numero',         ddl: `ALTER TABLE usuarios ADD COLUMN numero TEXT;` },
    { name: 'bairro',         ddl: `ALTER TABLE usuarios ADD COLUMN bairro TEXT;` },
    { name: 'cidade',         ddl: `ALTER TABLE usuarios ADD COLUMN cidade TEXT;` },
    { name: 'estado',         ddl: `ALTER TABLE usuarios ADD COLUMN estado TEXT;` },
    { name: 'telefone',       ddl: `ALTER TABLE usuarios ADD COLUMN telefone TEXT;` },
    { name: 'email',          ddl: `ALTER TABLE usuarios ADD COLUMN email TEXT;` },
    { name: 'redeSocial',     ddl: `ALTER TABLE usuarios ADD COLUMN redeSocial TEXT;` },
    { name: 'status',         ddl: `ALTER TABLE usuarios ADD COLUMN status TEXT DEFAULT 'ativo';` },
  ];

  for (const col of colunasNovas) {
    if (!tem(col.name)) {
      await db.exec(col.ddl);
    }
  }

  // Índice
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_usuarios_nome ON usuarios (nomeCompleto);`);
}

// ------------------------------
// Salvar (INSERT) — retorna lastID
// ------------------------------
async function salvarUsuario(usuario) {
  const db = await abrirBanco();

  // Normaliza valores esperados
  const payload = {
    nomeCompleto:   usuario.nomeCompleto ?? '',
    nomeSocial:     usuario.nomeSocial ?? null,
    dataNascimento: usuario.dataNascimento ?? '',

    cep:        usuario.endereco?.cep ?? '',
    logradouro: usuario.endereco?.logradouro ?? '',
    numero:     usuario.endereco?.numero ?? '',
    bairro:     usuario.endereco?.bairro ?? '',
    cidade:     usuario.endereco?.cidade ?? '',
    estado:     usuario.endereco?.estado ?? '',

    telefone:   usuario.telefone ?? null,
    email:      usuario.email ?? null,
    redeSocial: usuario.redeSocial ?? null,

    status:     (usuario.status === 'desativado') ? 'desativado' : 'ativo'
  };

  const stmt = await db.run(
    `
    INSERT INTO usuarios (
      nomeCompleto, nomeSocial, dataNascimento,
      cep, logradouro, numero, bairro, cidade, estado,
      telefone, email, redeSocial, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      payload.nomeCompleto, payload.nomeSocial, payload.dataNascimento,
      payload.cep, payload.logradouro, payload.numero, payload.bairro, payload.cidade, payload.estado,
      payload.telefone, payload.email, payload.redeSocial, payload.status
    ]
  );

  return stmt.lastID;
}

// ------------------------------
// Atualizar (UPDATE)
// ------------------------------
async function atualizarUsuario(usuario) {
  if (!usuario?.id) throw new Error('ID obrigatório para atualizar usuário.');

  const db = await abrirBanco();

  const payload = {
    id:           usuario.id,
    nomeCompleto: usuario.nomeCompleto ?? '',
    nomeSocial:   usuario.nomeSocial ?? null,
    dataNascimento: usuario.dataNascimento ?? '',

    cep:        usuario.endereco?.cep ?? '',
    logradouro: usuario.endereco?.logradouro ?? '',
    numero:     usuario.endereco?.numero ?? '',
    bairro:     usuario.endereco?.bairro ?? '',
    cidade:     usuario.endereco?.cidade ?? '',
    estado:     usuario.endereco?.estado ?? '',

    telefone:   usuario.telefone ?? null,
    email:      usuario.email ?? null,
    redeSocial: usuario.redeSocial ?? null,

    status:     (usuario.status === 'desativado') ? 'desativado' : 'ativo'
  };

  await db.run(
    `
    UPDATE usuarios
    SET
      nomeCompleto = ?,
      nomeSocial   = ?,
      dataNascimento = ?,
      cep        = ?,
      logradouro = ?,
      numero     = ?,
      bairro     = ?,
      cidade     = ?,
      estado     = ?,
      telefone   = ?,
      email      = ?,
      redeSocial = ?,
      status     = ?
    WHERE id = ?;
    `,
    [
      payload.nomeCompleto, payload.nomeSocial, payload.dataNascimento,
      payload.cep, payload.logradouro, payload.numero, payload.bairro, payload.cidade, payload.estado,
      payload.telefone, payload.email, payload.redeSocial, payload.status,
      payload.id
    ]
  );
}

// ------------------------------
// Listar (com filtro de status)
// soAtivos = true → retorna só ativos
// ------------------------------
async function listarUsuarios(soAtivos = true) {
  const db = await abrirBanco();
  const where = soAtivos ? `WHERE status = 'ativo'` : '';
  return db.all(`SELECT * FROM usuarios ${where} ORDER BY id ASC;`);
}

// ------------------------------
// Buscar por ID
// ------------------------------
async function buscarUsuarioPorId(id) {
  const db = await abrirBanco();
  return db.get(`SELECT * FROM usuarios WHERE id = ?;`, [id]);
}

// ------------------------------
// Excluir
// ------------------------------
async function excluirUsuario(id) {
  const db = await abrirBanco();
  await db.run(`DELETE FROM usuarios WHERE id = ?;`, [id]);
}

// ------------------------------
// IPC registration
// ------------------------------
function registrarUsuarioHandlers(ipcMain) {
  // Garante schema/migração no primeiro uso
  (async () => {
    await criarTabelaUsuarios();
    await migrarSchemaSeNecessario();
  })().catch(err => console.error('⚠️ Erro ao preparar schema de usuarios:', err));

  ipcMain.handle('usuario:cadastrar', async (event, dados) => {
    // retorna o ID criado (usado pelo front)
    return salvarUsuario(dados);
  });

  ipcMain.handle('usuario:listar', async (event, apenasAtivos = true) => {
    // por padrão, retorna apenas ativos; passe false para todos
    return listarUsuarios(apenasAtivos);
  });

  ipcMain.handle('usuario:buscarPorId', async (event, id) => {
    return buscarUsuarioPorId(id);
  });

  ipcMain.handle('usuario:atualizar', async (event, usuario) => {
    await atualizarUsuario(usuario);
    return true;
  });

  ipcMain.handle('usuario:excluir', async (event, id) => {
    await excluirUsuario(id);
    return true;
  });
}

// ------------------------------
// Exports
// ------------------------------
module.exports = {
  abrirBanco,
  criarTabelaUsuarios,
  migrarSchemaSeNecessario,
  salvarUsuario,
  atualizarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  excluirUsuario,
  registrarUsuarioHandlers
};
