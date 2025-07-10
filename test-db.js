const db = require('./backend/db/init');

(async () => {
  try {
    const resultado = await db.getAsync('SELECT * FROM assistidos WHERE id = ?', [2]);
    console.log('Resultado da consulta:', resultado);
  } catch (err) {
    console.error('Erro ao consultar assistido:', err);
  }
})();
