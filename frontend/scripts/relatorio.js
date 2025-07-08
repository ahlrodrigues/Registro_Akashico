// relatorio.js

const tabela = document.getElementById('tabelaUsuarios').querySelector('tbody');
const campoBusca = document.getElementById('busca');
const btnVer = document.getElementById('btnVer');
const selecionarTodos = document.getElementById('selecionarTodos');

// Cria uma linha da tabela
function criarLinha(usuario) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" class="selecionarLinha" data-id="${usuario.id}"></td>
      <td>${usuario.id}</td>
      <td>${usuario.nome}</td>
      <td>${usuario.apelido || ''}</td>
      <td>${usuario.telefone || ''}</td>
      <td>${usuario.email || ''}</td>
      <td>${usuario.grau}</td>
      <td>${usuario.status}</td>
    `;
    return tr;
  }

// Carrega usuários ativos na tabela
async function carregarUsuarios() {
  try {
    const usuarios = await window.api.listarUsuarios();
    tabela.innerHTML = '';

    usuarios.forEach(usuario => {
      tabela.appendChild(criarLinha(usuario));
    });
  } catch (err) {
    console.error('Erro ao carregar usuários:', err);
  }
}

// Filtro de busca
campoBusca.addEventListener('input', () => {
  const termo = campoBusca.value.toLowerCase();
  const linhas = tabela.querySelectorAll('tr');
  linhas.forEach(linha => {
    const nome = linha.cells[2].textContent.toLowerCase();
    linha.style.display = nome.includes(termo) ? '' : 'none';
  });
});

// Selecionar todos
selecionarTodos.addEventListener('change', () => {
  const checkboxes = tabela.querySelectorAll('.selecionarLinha');
  checkboxes.forEach(cb => cb.checked = selecionarTodos.checked);
});

// Botão Ver
btnVer.addEventListener('click', () => {
  const selecionado = [...document.querySelectorAll('.selecionarLinha')].find(cb => cb.checked);
  if (!selecionado) {
    alert('Selecione um usuário.');
    return;
  }
  const id = selecionado.dataset.id;
  window.abrirModalCadastro(id); // função do modalCadastro.js
});

// Inicializa carregando os usuários
carregarUsuarios();
