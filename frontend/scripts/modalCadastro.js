// modalCadastro.js
const usuarios = await window.api.listarUsuarios();


const modal = document.getElementById('modalCadastroUsuario');
const form = document.getElementById('formEditarUsuario');
const btnFechar = modal.querySelector('.modal-close');
const btnExcluir = document.getElementById('btnExcluir');
const campoStatus = document.getElementById('status');

let usuarioAtual = null;

// Abre o modal e preenche os campos
export async function abrirModalCadastro(id) {
  usuarioAtual = await buscarUsuarioPorId(id);
  if (!usuarioAtual) return alert('Usuário não encontrado.');

  // Preenche o formulário
  form.nome.value = usuarioAtual.nome;
  form.apelido.value = usuarioAtual.apelido;
  form.grau.value = usuarioAtual.grau;
  form.telefone.value = usuarioAtual.telefone;
  form.email.value = usuarioAtual.email;
  form.status.value = usuarioAtual.status || 'ativo';

  // Exibe modal
  modal.classList.remove('hidden');

  // Permissão: só ADM pode excluir
  const permissao = localStorage.getItem('funcaoUsuario');
  if (permissao === 'ADM') {
    btnExcluir.classList.remove('hidden');
  } else {
    btnExcluir.classList.add('hidden');
  }
}

// Fecha o modal
btnFechar.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Salvar alterações
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usuarioEditado = {
    ...usuarioAtual,
    nome: form.nome.value,
    apelido: form.apelido.value,
    grau: form.grau.value,
    telefone: form.telefone.value,
    email: form.email.value,
    status: form.status.value
  };
  await atualizarUsuario(usuarioEditado);
  alert('Cadastro atualizado com sucesso.');
  modal.classList.add('hidden');
  window.location.reload();
});

// Excluir usuário
btnExcluir.addEventListener('click', async () => {
  const confirmar = confirm('Tem certeza que deseja excluir este cadastro?');
  if (!confirmar) return;
  await excluirUsuario(usuarioAtual.id);
  alert('Cadastro excluído com sucesso.');
  modal.classList.add('hidden');
  window.location.reload();
});

// Expõe globalmente
window.abrirModalCadastro = abrirModalCadastro;
