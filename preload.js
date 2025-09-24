// ============================================
// Caminho: preload.js
// Objetivo: Expor API segura ao renderer (contextIsolation: true)
// Padrão exposto no window:
//   - api.invoke(canal, ...args)
//   - api.usuarios.*, api.presencas.*, api.passes.*
//   - Funções "flat" legadas para compatibilidade
// ============================================

const { contextBridge, ipcRenderer } = require("electron");

/** Invoca um canal IPC com try/catch + log de erro. */
async function safeInvoke(channel, ...args) {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (err) {
    console.error(`[PRELOAD] IPC failed: ${channel}`, err);
    throw err;
  }
}

contextBridge.exposeInMainWorld("api", {
  // -------- Fallback genérico (usado como último recurso pelo front)
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),

  // -------- USUÁRIOS (alinha com usuarioHandler.js -> 'usuario:*')
  usuarios: {
    cadastrar:   (dados)               => safeInvoke("usuario:cadastrar", dados),
    listar:      (apenasAtivos = true) => safeInvoke("usuario:listar",   apenasAtivos),
    buscarPorId: (id)                  => safeInvoke("usuario:buscarPorId", id),
    atualizar:   (usuario)             => safeInvoke("usuario:atualizar", usuario),
    excluir:     (id)                  => safeInvoke("usuario:excluir",   id),
    seed:        (lista)               => safeInvoke("usuario:seed",      lista),
    // (opcional) se existir no main
    login:       (email, whatsapp)     => safeInvoke("usuario:login", email, whatsapp),
  },

  // -------- PRESENÇAS (ajuste canais conforme seu handler)
  presencas: {
    listarPorUsuario: (usuarioId) => safeInvoke("presencas:listarPorUsuario", usuarioId),
    buscar:           (payload)   => safeInvoke("presencas:buscar", payload),
    adicionar:        (payload)   => safeInvoke("presencas:adicionar", payload),
    remover:          (payload)   => safeInvoke("presencas:remover",   payload),
  },

  // -------- PASSES (ajuste canais conforme seu handler)
  passes: {
    listarPorAssistido:   (id)  => safeInvoke("passes:buscarPorAssistido", id),
    buscarPorAssistido:   (id)  => safeInvoke("passes:buscarPorAssistido", id),
    imprimirParaUsuarios: (ids) => safeInvoke("passes:imprimirParaUsuarios", ids),
    registrar:            (idAssistido) => safeInvoke("passes:registrar", idAssistido),
  },

  // -------- Funções “flat” legadas (compatibilidade com código antigo)
  cadastrarUsuario:   (dados)               => safeInvoke("usuario:cadastrar", dados),
  listarUsuarios:     (apenasAtivos = true) => safeInvoke("usuario:listar", apenasAtivos),
  buscarUsuarioPorId: (id)                  => safeInvoke("usuario:buscarPorId", id),
  atualizarUsuario:   (usuario)             => safeInvoke("usuario:atualizar", usuario),
  excluirUsuario:     (id)                  => safeInvoke("usuario:excluir", id),

  buscarPassesPorAssistido: (id) => safeInvoke("passes:buscarPorAssistido", id),
  registrarPasse:           (idAssistido) => safeInvoke("passes:registrar", idAssistido),

  listarAssistidos: () => safeInvoke("assistidos:listar"),
  buscarPresencas:  (assistidoId, ano, mes) => safeInvoke("presencas:buscar", { assistidoId, ano, mes }),
  adicionarPresenca:(assistidoId, data)     => safeInvoke("presencas:adicionar", { assistidoId, data }),
  removerPresenca:  (assistidoId, data)     => safeInvoke("presencas:remover",   { assistidoId, data }),
});
