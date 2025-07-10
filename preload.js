const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  cadastrarUsuario: (dados) => ipcRenderer.invoke('usuario:cadastrar', dados),
  loginUsuario: (email, whatsapp) => ipcRenderer.invoke('usuario:login', email, whatsapp),
  listarUsuarios: () => ipcRenderer.invoke('usuario:listar'),
  buscarUsuarioPorId: (id) => ipcRenderer.invoke('usuario:buscarPorId', id),
  atualizarUsuario: (usuario) => ipcRenderer.invoke('usuario:atualizar', usuario),
  excluirUsuario: (id) => ipcRenderer.invoke('usuario:excluir', id),

  // ✅ ADICIONE ESTA LINHA:
  registrarPasse: (idAssistido) => ipcRenderer.invoke('passes:registrar', idAssistido)
});
