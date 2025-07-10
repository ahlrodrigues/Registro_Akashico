const db = require('./backend/db/init');
console.log(db);

(async () => {
  try {
    const nome = 'João da Luz';
    const resultado = await db.runAsync(`INSERT INTO assistidos (nome) VALUES (?)`, [nome]);
    console.log('Assistido inserido com sucesso. ID:', resultado.lastID);
  } catch (err) {
    console.error('Erro ao inserir assistido:', err);
  }
})();
