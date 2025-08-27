// ============================================
// Caminho: preload.js
// Objetivo: Expor API segura ao renderer (contextIsolation: true)
// Notas:
// - Padroniza canais: 'usuario:*' (sem 'usuarios:*')
// - Remove duplicidade de buscarUsuarioPorId
// - listarUsuarios(apenasAtivos = true) → bate com o handler
// - Helper safeInvoke com logs
// ============================================

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Invoca um canal IPC com try/catch + logs.
 * @template T
 * @param {string} channel
 * @param {...any} args
 * @returns {Promise<T>}
 */
async function safeInvoke(channel, ...args) {
  try {
    // Log enxuto para diagnóstico
    // console.debug(`[PRELOAD] invoke: ${channel}`, args);
    const result = await ipcRenderer.invoke(channel, ...args);
    return result;
  } catch (err) {
    console.error(`[PRELOAD] IPC failed: ${channel}`, err);
    throw err;
  }
}

contextBridge.exposeInMainWorld('api', {
  // ========== Usuários (novo schema) ==========
  /**
   * Cadastra usuário e retorna o ID criado.
   * @param {object} dados
   * @returns {Promise<number>}
   */
  cadastrarUsuario: (dados) => safeInvoke('usuario:cadastrar', dados),

  /**
   * Lista usuários. Por padrão, apenas ativos.
   * @param {boolean} [apenasAtivos=true]
   * @returns {Promise<Array>}
   */
  listarUsuarios: (apenasAtivos = true) => safeInvoke('usuario:listar', apenasAtivos),

  /**
   * Busca um usuário por ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  buscarUsuarioPorId: (id) => safeInvoke('usuario:buscarPorId', id),

  /**
   * Atualiza um usuário existente.
   * @param {object} usuario
   * @returns {Promise<boolean>}
   */
  atualizarUsuario: (usuario) => safeInvoke('usuario:atualizar', usuario),

  /**
   * Exclui um usuário por ID.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  excluirUsuario: (id) => safeInvoke('usuario:excluir', id),

  // (Opcional) Login — mantenha apenas se houver handler correspondente
  /**
   * Login por email/whatsapp (se houver handler 'usuario:login').
   * @param {string} email
   * @param {string} whatsapp
   */
  loginUsuario: (email, whatsapp) => safeInvoke('usuario:login', email, whatsapp),

  // ========== Passes ==========
  buscarPassesPorAssistido: (id) => safeInvoke('passes:buscarPorAssistido', id),
  registrarPasse: (idAssistido) => safeInvoke('passes:registrar', idAssistido),

  // ========== Assistidos / Presenças ==========
  listarAssistidos: () => safeInvoke('assistidos:listar'),
  buscarPresencas: (assistidoId, ano, mes) =>
    safeInvoke('presencas:buscar', { assistidoId, ano, mes }),
  adicionarPresenca: (assistidoId, data) =>
    safeInvoke('presencas:adicionar', { assistidoId, data }),
  removerPresenca: (assistidoId, data) =>
    safeInvoke('presencas:remover', { assistidoId, data }),
});
