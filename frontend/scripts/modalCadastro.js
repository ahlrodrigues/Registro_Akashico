const modal = document.getElementById('modalCadastroUsuario');
const form = document.getElementById('formEditarUsuario');
const btnFechar = modal.querySelector('.modal-close');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnExcluir = document.getElementById('btnExcluir');

let usuarioAtual = null;

/**
 * Abre o modal e preenche os campos com os dados do usuário
 * @param {number} id - ID do usuário
 */
export async function abrirModalCadastro(id) {
  try {
    usuarioAtual = await window.api.buscarUsuarioPorId(id);

    if (!usuarioAtual) {
      throw new Error('Usuário não encontrado');
    }

    // Preenche o formulário
    form.nome.value = usuarioAtual.nome || '';
    form.apelido.value = usuarioAtual.apelido || '';
    form.grau.value = usuarioAtual.grau || 'assistido';
    form.telefone.value = usuarioAtual.telefone || '';
    form.email.value = usuarioAtual.email || '';
    form.status.value = usuarioAtual.status || 'ativo';

    // Mostra botão Excluir se for ADM
    const permissao = localStorage.getItem('funcaoUsuario');
    btnExcluir.classList.toggle('hidden', permissao !== 'ADM');
    btnExcluir.dataset.id = usuarioAtual.id;

    // Abre o modal
    modal.classList.remove('hidden');
  } catch (erro) {
    console.error('Erro ao abrir modal de cadastro:', erro);
    alert('Erro ao carregar dados do usuário.');
  }
}

/**
 * Fecha o modal (botão X)
 */
btnFechar.addEventListener('click', () => {
  modal.classList.add('hidden');
});

/**
 * Fecha o modal (botão "Fechar")
 */
btnFecharModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

/**
 * Salvar alterações do formulário
 */
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

  try {
    await window.api.atualizarUsuario(usuarioEditado);
    alert('Cadastro atualizado com sucesso!');
    modal.classList.add('hidden');
    if (typeof window.carregarRelatorio === 'function') {
      window.carregarRelatorio(); // Atualiza sem reload
    }
  } catch (error) {
    console.error('Erro ao salvar cadastro:', error);
    alert('Erro ao salvar cadastro.');
  }
});

/**
 * Excluir usuário atual
 */
btnExcluir.addEventListener('click', async () => {
  const confirmar = confirm('Tem certeza que deseja excluir este cadastro?');
  if (!confirmar) return;

  try {
    await window.api.excluirUsuario(usuarioAtual.id);
    alert('Cadastro excluído com sucesso!');
    modal.classList.add('hidden');
    if (typeof window.carregarRelatorio === 'function') {
      window.carregarRelatorio(); // Atualiza sem reload
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    alert('Erro ao excluir cadastro.');
  }
});

// Expõe função para uso externo
window.abrirModalCadastro = abrirModalCadastro;
