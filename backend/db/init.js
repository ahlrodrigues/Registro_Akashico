const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'usuarios.db');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    nomeSocial TEXT,
    nascimento TEXT,
    grau TEXT,
    telefone TEXT,
    redesSociais TEXT,
    email TEXT,
    whatsapp TEXT,
    funcao TEXT DEFAULT 'pendente',
    cadastradoEm TEXT
  )`);
});

db.close();
