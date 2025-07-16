// backend/handlers/statusHandler.js
const fs = require('fs');
const path = require('path');
const db = require('../db/init');

// Caminho do arquivo de log
const logPath = path.resolve('log', 'status.log');

// Garante que a pasta de log existe
function garantirPastaLog() {
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Grava um texto com timestamp no log
function registrarLog(texto) {
  garantirPastaLog();
  const agora = new Date().toISOString();
  const linha = `[${agora}] ${texto}\n`;
  fs.appendFileSync(logPath, linha);
}

/**
 * Desativa assistidos sem presença há mais de 90 dias
 */
    async function atualizarStatusAutomaticamente() {
  try {
    const hoje = new Date();
    hoje.setDate(hoje.getDate() - 90);
    const limite = hoje.toISOString().split('T')[0];

    const sql = `
      UPDATE assistidos
      SET status = 'desativado'
      WHERE status = 'ativo'
        AND (ultima_presenca IS NULL OR DATE(ultima_presenca) < ?)
    `;

    const resultado = await db.runAsync(sql, [limite]);

    const info = `Status atualizado: usuários com ausência > 90 dias desativados.`;
    registrarLog(info);
    console.log(`✅ ${info}`);
  } catch (erro) {
    const msgErro = `Erro ao atualizar status: ${erro.message}`;
    registrarLog(msgErro);
    console.error(`❌ ${msgErro}`);
  }
}
module.exports = {
    atualizarStatusAutomaticamente,
  };