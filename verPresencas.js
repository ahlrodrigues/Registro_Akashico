// PATH: verPresencas.js
const path = require("path");
const Database = require("better-sqlite3");

// Caminho do banco (igual ao usado no handler)
const pastaDb = path.join(process.env.HOME || process.env.USERPROFILE, ".seara-de-luz");
const dbPath = path.join(pastaDb, "database.sqlite");

// Conecta
const db = new Database(dbPath);

// Conta total
const total = db.prepare("SELECT COUNT(*) AS qtd FROM presencas").get();
console.log(`📊 Total de presenças: ${total.qtd}`);

// Lista alguns registros
const rows = db.prepare("SELECT * FROM presencas ORDER BY id DESC LIMIT 5").all();
console.log("📋 Últimos registros:", rows);
