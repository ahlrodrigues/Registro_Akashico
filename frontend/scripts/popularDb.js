const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const baseDir = path.join(process.env.APPDATA || path.join(process.env.HOME, '.config'), 'seara-de-luz');
const dbPath = '/home/ahlr/seara-de-luz/usuarios.db';

// Garante que a pasta existe
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

async function popularBanco() {
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

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

  const usuarios = [
    { nome: 'João da Luz', apelido: 'Joãozinho', grau: 'servidor', telefone: '11988887777', email: 'joao@example.com' },
    { nome: 'Maria Clara', apelido: 'Clarinha', grau: 'discípulo', telefone: '11977776666', email: 'maria@example.com' },
    { nome: 'Pedro Auxiliado', apelido: 'Pedrinho', grau: 'assistido', telefone: '11999994444', email: 'pedro@example.com' },
    { nome: 'Ana Luz', apelido: 'Aninha', grau: 'assistido', telefone: '11911112222', email: 'ana@example.com' }
  ];

  for (const u of usuarios) {
    await db.run(
      `INSERT INTO usuarios (nome, apelido, grau, telefone, email, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [u.nome, u.apelido, u.grau, u.telefone, u.email, 'ativo']
    );
  }

  console.log('✅ Banco populado com sucesso!');
  await db.close();
}

popularBanco().catch(err => {
  console.error('❌ Erro ao popular banco:', err);
});
