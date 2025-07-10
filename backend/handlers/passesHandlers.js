const { registrarPasse } = require('../passesHandler');

function registrarPasseHandler(ipcMain) {
  ipcMain.handle('passes:registrar', async (event, idAssistido) => {
    console.log(`🔁 Registrando passe para ID ${idAssistido}`);
    return await registrarPasse(idAssistido);
  });
}

module.exports = {
  registrarPasseHandler
};
