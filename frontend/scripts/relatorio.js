import { abrirModalCadastro } from './modalCadastro.js';

document.addEventListener('DOMContentLoaded', () => {
  // Referências à DOM
  const tabela = document.getElementById('tabelaUsuarios').getElementsByTagName('tbody')[0];
  const campoBusca = document.getElementById('busca');
  const selecionarTodos = document.getElementById('selecionarTodos');
  const btnVer = document.getElementById('btnVer');
  const btnImprimirPasse = document.getElementById('btnImprimirPasse');

  // Desabilita os botões ao carregar
  btnVer.disabled = true;
  btnImprimirPasse.disabled = true;

  /**
   * Atualiza o estado dos botões com base na seleção
   */
  function atualizarEstadoDosBotoes() {
    const selecionados = tabela.querySelectorAll('.selecionarLinha:checked');
    const habilitar = selecionados.length === 1;
    btnVer.disabled = !habilitar;
    btnImprimirPasse.disabled = !habilitar;
  }

  /**
   * Carrega os usuários e popula a tabela
   */
  async function carregarRelatorio() {
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

        // A cada checkbox individual, escuta mudanças
        checkbox.addEventListener('change', atualizarEstadoDosBotoes);

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

      atualizarEstadoDosBotoes(); // Garante estado correto após recarregar

    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  }

  /**
   * Filtro de busca por nome
   */
  campoBusca?.addEventListener('input', () => {
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
  selecionarTodos?.addEventListener('change', () => {
    const checkboxes = tabela.querySelectorAll('.selecionarLinha');
    checkboxes.forEach(cb => cb.checked = selecionarTodos.checked);
    atualizarEstadoDosBotoes();
  });

  /**
   * Ação do botão Ver
   */
  btnVer?.addEventListener('click', () => {
    const selecionados = document.querySelectorAll(".selecionarLinha:checked");

    if (selecionados.length !== 1) {
      exibirAlerta("Selecione exatamente um registro para visualizar.");
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
   * Ação do botão Imprimir Passe
   */
  btnImprimirPasse?.addEventListener('click', async () => {
    const selecionados = document.querySelectorAll(".selecionarLinha:checked");

    if (selecionados.length !== 1) {
      exibirAlerta("Selecione exatamente um assistido para imprimir o passe.");
      return;
    }

    const id = selecionados[0].dataset.id;
    if (!id) {
      exibirAlerta("Erro: ID do assistido não encontrado.");
      return;
    }

    try {
      const resposta = await window.api.registrarPasse(Number(id));
      if (resposta.sucesso) {
        exibirAlerta(`✅ Passe registrado para <strong>${resposta.nome}</strong><br>Tipo: <strong>${resposta.tipoPasse}</strong>`);
      } else {
        exibirAlerta(`❌ Erro: ${resposta.erro}`);
      }
    } catch (err) {
      exibirAlerta(`❌ Falha de comunicação: ${err.message}`);
    }
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

  // Expõe para o modal
  window.carregarRelatorio = carregarRelatorio;
});
