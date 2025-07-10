const db = require('./db/init.js');
const { getDataAtualISO } = require('./utils/data.js');
const { imprimirPasse } = require('./impressora.js');

async function registrarPasse(idAssistido) {
  try {
    const dataAgora = getDataAtualISO();

    // 1. Buscar assistido
    const assistido = await db.getAsync(`SELECT * FROM assistidos WHERE id = ?`, [idAssistido]);
    if (!assistido) {
      throw new Error('Assistido não encontrado.');
    }

    // 2. Registrar presença
    await db.runAsync(
      `INSERT INTO presencas (id_assistido, data_hora) VALUES (?, ?)`,
      [idAssistido, dataAgora]
    );

    // 3. Atualizar contadores
    const novasPresencas = (assistido.cont_presencas || 0) + 1;

    let tipoPasse = assistido.tipo_passe;
    let novoStatus = assistido.status;

    if (novasPresencas === 4) {
      tipoPasse = 'EXAME';
    } else if (novasPresencas === 5) {
      tipoPasse = 'ENTREVISTA';
      novoStatus = 'aguardando entrevista';
    }

    // 4. Atualizar dados do assistido
    await db.runAsync(
      `UPDATE assistidos
       SET cont_presencas = ?, cont_faltas = 0, tipo_passe = ?, status = ?, ultima_presenca = ?
       WHERE id = ?`,
      [novasPresencas, tipoPasse, novoStatus, dataAgora, idAssistido]
    );

    // 5. Imprimir passe (simulado)
    await imprimirPasse(assistido.nome, tipoPasse);

    return {
      sucesso: true,
      nome: assistido.nome,
      tipoPasse
    };

  } catch (erro) {
    console.error('Erro ao registrar passe:', erro);
    return { sucesso: false, erro: erro.message };
  }
}

module.exports = {
  registrarPasse
};
