const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'usuarios.db');
const db = new sqlite3.Database(dbPath);

// Criação de tabelas...
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS assistidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo_passe TEXT DEFAULT 'COMUM',
    cont_presencas INTEGER DEFAULT 0,
    cont_faltas INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ativo',
    ultima_presenca TEXT
  )`);
});

// Promisificação correta
db.getAsync = (sql, params) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
});

db.runAsync = (sql, params) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve({ lastID: this.lastID, changes: this.changes });
  });
});

db.allAsync = (sql, params) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});

module.exports = db;
