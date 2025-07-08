// relatorio.js

import { abrirModalCadastro } from './modalCadastro.js';

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
  const checkboxes = document.querySelectorAll(".selecionarLinha:checked");

  if (checkboxes.length === 0) {
    exibirAlerta("Por favor, selecione um registro para visualizar.");
    return;
  }

  if (checkboxes.length > 1) {
    exibirAlerta("Selecione apenas um registro por vez.");
    return;
  }

  const checkboxSelecionado = checkboxes[0];
  const id = checkboxSelecionado.dataset.id;

  if (!id) {
    exibirAlerta("Erro: ID do usuário não encontrado no checkbox selecionado.");
    return;
  }

  abrirModalCadastro(id);
});

// Exibe um alerta simples reutilizando o modal de cadastro como base
function exibirAlerta(mensagem) {
  const modal = document.getElementById("modalCadastroUsuario");
  const form = modal.querySelector("form");
  form.classList.add("hidden");

  modal.querySelector("h2").textContent = "Atenção";

  // Limpa mensagens de alerta anteriores, se houver
  const conteudoModal = modal.querySelector(".modal-content");
  const alertasExistentes = conteudoModal.querySelectorAll(".alerta-temporaria");
  alertasExistentes.forEach(alerta => alerta.remove());

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
    conteudoModal.removeChild(alertaDiv);
    form.classList.remove("hidden");
    modal.classList.add("hidden");
  });
}

// Inicializa carregando os usuários
carregarUsuarios();
