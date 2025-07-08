// modalCadastro.js
const modal = document.getElementById('modalCadastroUsuario');
const form = document.getElementById('formEditarUsuario');
const btnFechar = modal.querySelector('.modal-close');
const btnExcluir = document.getElementById('btnExcluir');
const campoStatus = document.getElementById('status');

let usuarioAtual = null;

// Abre o modal e preenche os campos
export async function abrirModalCadastro(id) {
    try {
      const usuario = await window.api.buscarUsuarioPorId(id);
  
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
  
      // Preenche os campos do modal
      document.getElementById('nome').value = usuario.nome;
      document.getElementById('apelido').value = usuario.apelido || '';
      document.getElementById('grau').value = usuario.grau;
      document.getElementById('telefone').value = usuario.telefone || '';
      document.getElementById('email').value = usuario.email || '';
      document.getElementById('status').value = usuario.status;
  
      // Mostra o botão Excluir
      const btnExcluir = document.getElementById('btnExcluir');
      btnExcluir.classList.remove('hidden');
      btnExcluir.dataset.id = usuario.id;
  
      // Exibe o modal
      document.getElementById('modalCadastroUsuario').classList.remove('hidden');
    } catch (erro) {
      console.error('Erro ao abrir modal de cadastro:', erro);
      alert('Erro ao carregar dados do usuário.');
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
