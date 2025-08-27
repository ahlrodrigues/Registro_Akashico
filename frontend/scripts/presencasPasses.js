// scripts/presencasPasses.js
import { renderizarCalendario } from './calendarioPresencas.js';

/**
 * Abre o modal de presenças e passes do assistido
 * @param {number} id - ID do assistido
 */
export async function abrirModalPresencaPasses(id) {
  try {
    const dados = await window.api.buscarUsuarioPorId(id);
    if (!dados) {
      exibirAlerta("Usuário não encontrado.");
      return;
    }

    // Preenche o nome no modal
    document.getElementById("nomeAssistidoPresenca").textContent = dados.nome;

    // Exibe o modal
    document.getElementById("modalPresencaPasses").classList.remove("hidden");

    // Renderiza o calendário
    await renderizarCalendario(dados.id);

    // Carrega os passes
    await carregarListaDePasses(dados.id);
  } catch (erro) {
    console.error("Erro ao abrir modal de presenças:", erro);
    exibirAlerta("Erro ao carregar dados do assistido.");
  }
}

/**
 * Fecha o modal
 */
document.getElementById("btnFecharPresencaPasses")?.addEventListener("click", () => {
  document.getElementById("modalPresencaPasses").classList.add("hidden");
});

/**
 * Carrega os passes registrados no banco e exibe na lista
 */
async function carregarListaDePasses(assistidoId) {
  const ul = document.getElementById("passes-assistido");
  ul.innerHTML = '';

  try {
    const passes = await window.api.buscarPassesPorAssistido(assistidoId);

    if (!passes || passes.length === 0) {
      ul.innerHTML = '<li>Nenhum passe registrado neste mês.</li>';
      return;
    }

    passes.forEach(passe => {
      const li = document.createElement("li");
      li.textContent = `${formatarData(passe.data)} às ${passe.hora} - ${passe.tipo}`;
      ul.appendChild(li);
    });

  } catch (erro) {
    console.error("Erro ao carregar passes:", erro);
    ul.innerHTML = '<li>Erro ao carregar os dados.</li>';
  }
}

/**
 * Formata data de YYYY-MM-DD para dd/mm/yyyy
 */
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}
