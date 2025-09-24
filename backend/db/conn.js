// ==============================================
// PATH: backend/db/conn.js
// OBJ:  Resolver e abrir o caminho do banco + logar para debug
// ==============================================
const { app } = require('electron');     // se estiver no main process
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
console.log('[DB] Usando arquivo:', DB_PATH);


// 1) Defina um único caminho (priorize .env)
const DB_PATH =
  process.env.SEARA_DB
  || path.join(process.env.HOME || process.env.USERPROFILE, '.seara-de-luz', 'database.sqlite');

// 2) Garanta pasta existente
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// 3) Log VISÍVEL no console
console.log('[DB] Usando arquivo:', DB_PATH);

// 4) Abra o DB
const db = new Database(DB_PATH);

module.exports = { db, DB_PATH };
