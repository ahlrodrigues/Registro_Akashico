import { abrirModalCadastro } from './modalCadastro.js';

// Referências aos elementos da DOM
const tabela = document.getElementById('tabelaUsuarios').getElementsByTagName('tbody')[0];
const campoBusca = document.getElementById('busca');
const selecionarTodos = document.getElementById('selecionarTodos');
const btnVer = document.getElementById('btnVer');

/**
 * Carrega os usuários e popula a tabela
 */
export async function carregarRelatorio() {
  try {
    const usuarios = await window.api.listarUsuarios(false);
    tabela.innerHTML = '';

    usuarios.forEach(usuario => {
      const linha = tabela.insertRow();

      // [0] Checkbox
      const celulaCheckbox = linha.insertCell();
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('selecionarLinha');
      checkbox.dataset.id = usuario.id;
      celulaCheckbox.appendChild(checkbox);

      // [1] ID
      linha.insertCell().textContent = usuario.id;

      // [2] Nome
      linha.insertCell().textContent = usuario.nome;

      // [3] Apelido
      linha.insertCell().textContent = usuario.apelido || '';

      // [4] Telefone
      linha.insertCell().textContent = usuario.telefone || '';

      // [5] Email
      linha.insertCell().textContent = usuario.email || '';

      // [6] Grau
      linha.insertCell().textContent = usuario.grau || '';

      // [7] Status
      linha.insertCell().textContent = usuario.status || '';
    });
  } catch (err) {
    console.error('Erro ao carregar usuários:', err);
  }
}

/**
 * Filtro de busca por nome
 */
campoBusca.addEventListener('input', () => {
  const termo = campoBusca.value.toLowerCase();
  const linhas = tabela.querySelectorAll('tr');
  linhas.forEach(linha => {
    const nome = linha.cells[2].textContent.toLowerCase();
    linha.style.display = nome.includes(termo) ? '' : 'none';
  });
});

/**
 * Selecionar/Deselecionar todos os checkboxes
 */
selecionarTodos.addEventListener('change', () => {
  const checkboxes = tabela.querySelectorAll('.selecionarLinha');
  checkboxes.forEach(cb => cb.checked = selecionarTodos.checked);
});

/**
 * Ação do botão Ver
 */
btnVer.addEventListener('click', () => {
  const selecionados = document.querySelectorAll(".selecionarLinha:checked");

  if (selecionados.length === 0) {
    exibirAlerta("Por favor, selecione um registro para visualizar.");
    return;
  }

  if (selecionados.length > 1) {
    exibirAlerta("Selecione apenas um registro por vez.");
    return;
  }

  const id = selecionados[0].dataset.id;
  if (!id) {
    exibirAlerta("Erro: ID do usuário não encontrado.");
    return;
  }

  abrirModalCadastro(Number(id));
});

/**
 * Exibe alerta no modal (temporário)
 */
function exibirAlerta(mensagem) {
  const modal = document.getElementById("modalCadastroUsuario");
  const form = modal.querySelector("form");
  const titulo = modal.querySelector("h2");
  const conteudoModal = modal.querySelector(".modal-box");

  form.classList.add("hidden");
  titulo.textContent = "Atenção";

  // Remove alertas anteriores
  const alertas = conteudoModal.querySelectorAll(".alerta-temporaria");
  alertas.forEach(el => el.remove());

  const alertaDiv = document.createElement("div");
  alertaDiv.classList.add("alerta-temporaria");
  alertaDiv.innerHTML = `
    <p style="margin: 20px 0; text-align: center;">${mensagem}</p>
    <div style="text-align: center;">
      <button class="fechar-alerta">OK</button>
    </div>
  `;
  conteudoModal.appendChild(alertaDiv);

  modal.classList.remove("hidden");

  alertaDiv.querySelector(".fechar-alerta").addEventListener("click", () => {
    alertaDiv.remove();
    form.classList.remove("hidden");
    titulo.textContent = "Editar Cadastro";
    modal.classList.add("hidden");
  });
}

// Inicializa o relatório ao carregar a página
carregarRelatorio();

// Expõe a função para ser usada no modal
window.carregarRelatorio = carregarRelatorio;
