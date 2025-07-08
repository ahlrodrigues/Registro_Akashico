// backend/handlers/assistidosHandler.js

function registrarAssistidosHandlers(ipcMain) {
  ipcMain.handle('assistidos:listar', async () => {
    // Aqui você pode buscar os assistidos de um JSON, SQLite, etc.
    const listaFicticia = [
      { id: 1, nome: 'João da Luz', observacoes: 'Presença regular' },
      { id: 2, nome: 'Maria Esperança', observacoes: 'Em tratamento' },
    ];
    return listaFicticia;
  });
}

module.exports = { registrarAssistidosHandlers };
