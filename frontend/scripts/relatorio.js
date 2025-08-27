// =====================================================
// PATH: frontend/js/relatorio.js
// =====================================================

/**
 * Relatório de Assistidos + Modal de Calendário de Presenças
 * - Integra a UI do relatório com o calendário mensal de presenças.
 * - NÃO usa window.require (contextIsolation: true).
 * - Usa as funções do módulo calendarioPresencas.js (renderer) que,
 *   por sua vez, chamam window.api.* expostas pelo preload.
 *
 * Requisitos no HTML:
 * - Tabela com id="tabelaUsuarios" (tbody).
 * - Checkbox por linha com class="selecionarLinha" e data-id no assistido.
 * - Botão "Abrir Calendário" com id="btnCalendario".
 * - Modal com id="modalCalendario" contendo:
 *      #calTitle (título mês/ano)
 *      #calGrid  (grade dos dias)
 *      #calPrev  (botão mês anterior)
 *      #calNext  (botão próximo mês)
 *      #calClose (fechar)
 * - style.css aplica o visual; textos podem vir do i18n (pasta i18n/).
 */

import {
  carregarPresencasDoMes,
  marcarPresenca,
  desmarcarPresenca,
} from "./calendarioPresencas.js";

// ---------------------------
// Referências de elementos
// ---------------------------
const tabelaTbody = document.querySelector("#tabelaUsuarios tbody");
const btnCalendario = document.getElementById("btnCalendario");

// Elementos do modal de calendário
const modal = document.getElementById("modalCalendario");
const calTitle = document.getElementById("calTitle");
const calGrid = document.getElementById("calGrid");
const calPrev = document.getElementById("calPrev");
const calNext = document.getElementById("calNext");
const calClose = document.getElementById("calClose");

// ---------------------------
// Estado do calendário
// ---------------------------
let estado = {
  assistidoId: null,
  ano: null,
  mes: null, // 1..12
  // Set com strings "YYYY-MM-DD" dos dias presentes
  presencasSet: new Set(),
};

// ---------------------------
// Utilidades de i18n
// ---------------------------
function obterNomeMes(idxMes1a12) {
  // Tenta pegar do i18n global (se existir), senão usa fallback PT
  const fallback = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  // Ex.: window.i18n?.months?.[lang]?  — aqui deixamos simples
  return fallback[idxMes1a12 - 1] || String(idxMes1a12);
}

function formatarISO(ano, mes1a12, dia) {
  const m = String(mes1a12).padStart(2, "0");
  const d = String(dia).padStart(2, "0");
  return `${ano}-${m}-${d}`;
}

// ---------------------------
// Seleção no relatório
// ---------------------------
/**
 * Retorna o ID do assistido marcado (garante apenas 1 selecionado).
 * Se houver 0 ou >1 selecionados, retorna null.
 */
function obterAssistidoSelecionado() {
  const marcados = tabelaTbody.querySelectorAll('.selecionarLinha:checked');
  if (marcados.length !== 1) return null;
  const id = Number(marcados[0].dataset.id);
  return Number.isInteger(id) ? id : null;
}

// ---------------------------
// Render do calendário
// ---------------------------
/**
 * Renderiza o grid do mês corrente (estado.ano/estado.mes).
 * Marca os dias com presença usando a classe 'presente'.
 * Permite clique para alternar (marcar/desmarcar) presença.
 */
function renderizarCalendario() {
  const { ano, mes, presencasSet } = estado;

  // Cabeçalho
  calTitle.textContent = `${obterNomeMes(mes)} de ${ano}`;

  // Limpa grid
  calGrid.innerHTML = "";

  // Descobre o primeiro dia da semana do mês e total de dias
  const primeiro = new Date(ano, mes - 1, 1);
  const inicioSemana = primeiro.getDay(); // 0=Dom,1=Seg,...
  const totalDias = new Date(ano, mes, 0).getDate();

  // Pode ajustar a semana para iniciar em segunda (opcional)
  // Aqui manteremos iniciado no domingo (compatível com getDay()).

  // Cria "blocos vazios" antes do dia 1 (offset)
  for (let i = 0; i < inicioSemana; i++) {
    const vazio = document.createElement("div");
    vazio.className = "cal-dia cal-dia--vazio";
    calGrid.appendChild(vazio);
  }

  // Cria um bloco para cada dia do mês
  for (let dia = 1; dia <= totalDias; dia++) {
    const iso = formatarISO(ano, mes, dia);
    const cel = document.createElement("button");
    cel.className = "cal-dia";
    cel.type = "button";
    cel.dataset.date = iso;
    cel.textContent = String(dia);

    if (presencasSet.has(iso)) {
      cel.classList.add("presente");
      cel.setAttribute("aria-pressed", "true");
      cel.title = "Presença registrada";
    } else {
      cel.setAttribute("aria-pressed", "false");
      cel.title = "Clique para marcar presença";
    }

    // Clique para alternar presença
    cel.addEventListener("click", async () => {
      const tem = presencasSet.has(iso);
      // Otimista: atualiza visual primeiro
      cel.disabled = true;

      try {
        let ok = false;
        if (!tem) {
          ok = await marcarPresenca(estado.assistidoId, iso);
          if (ok) {
            presencasSet.add(iso);
            cel.classList.add("presente");
            cel.setAttribute("aria-pressed", "true");
            cel.title = "Presença registrada";
          }
        } else {
          ok = await desmarcarPresenca(estado.assistidoId, iso);
          if (ok) {
            presencasSet.delete(iso);
            cel.classList.remove("presente");
            cel.setAttribute("aria-pressed", "false");
            cel.title = "Clique para marcar presença";
          }
        }
      } catch (e) {
        console.error("[Calendário] Falha ao alternar presença:", e);
      } finally {
        cel.disabled = false;
      }
    });

    calGrid.appendChild(cel);
  }
}

/**
 * Carrega do backend as presenças do mês corrente e re-renderiza.
 */
async function carregarMesEAtualizar() {
  const { assistidoId, ano, mes } = estado;
  const lista = await carregarPresencasDoMes(assistidoId, ano, mes);
  estado.presencasSet = new Set((lista || []).map((r) => r.data));
  renderizarCalendario();
}

// ---------------------------
// Navegação do mês no modal
// ---------------------------
calPrev?.addEventListener("click", () => {
  let { ano, mes } = estado;
  mes -= 1;
  if (mes < 1) {
    mes = 12;
    ano -= 1;
  }
  estado.mes = mes;
  estado.ano = ano;
  carregarMesEAtualizar();
});

calNext?.addEventListener("click", () => {
  let { ano, mes } = estado;
  mes += 1;
  if (mes > 12) {
    mes = 1;
    ano += 1;
  }
  estado.mes = mes;
  estado.ano = ano;
  carregarMesEAtualizar();
});

calClose?.addEventListener("click", () => {
  fecharModalCalendario();
});

// ---------------------------
// Abertura/fechamento do modal
// ---------------------------
function abrirModalCalendario() {
  if (!modal) return;
  modal.classList.add("ativo");
  modal.setAttribute("aria-hidden", "false");
}

function fecharModalCalendario() {
  if (!modal) return;
  modal.classList.remove("ativo");
  modal.setAttribute("aria-hidden", "true");
}

// Fecha com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.classList.contains("ativo")) {
    fecharModalCalendario();
  }
});

// ---------------------------
// Botão "Abrir Calendário"
// ---------------------------
btnCalendario?.addEventListener("click", async () => {
  // Garante seleção de 1 assistido
  const selecionado = obterAssistidoSelecionado();
  if (!selecionado) {
    // Aqui você pode usar seu modalAviso padrão
    alert("Selecione exatamente 1 assistido para abrir o calendário.");
    return;
  }

  // Define estado inicial com mês atual
  const agora = new Date();
  estado.assistidoId = selecionado;
  estado.ano = agora.getFullYear();
  estado.mes = agora.getMonth() + 1;

  abrirModalCalendario();
  await carregarMesEAtualizar();
});

// ---------------------------
// (Opcional) Carregar tabela
// ---------------------------
// Se você já tem outro módulo que popula a tabela, mantenha.
// Abaixo fica apenas um exemplo de "placeholder" caso queira:
export async function carregarRelatorio() {
  // Exemplo: se já existir window.api.listarUsuarios(false)
  if (!window.api?.listarUsuarios) return;

  try {
    const usuarios = await window.api.listarUsuarios(false);
    tabelaTbody.innerHTML = "";

    usuarios.forEach((usuario) => {
      const linha = tabelaTbody.insertRow();

      // [0] Checkbox
      const c0 = linha.insertCell();
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.className = "selecionarLinha";
      chk.dataset.id = usuario.id;
      c0.appendChild(chk);

      // [1] ID
      linha.insertCell().textContent = usuario.id;

      // [2] Nome
      linha.insertCell().textContent = usuario.nome || usuario.aluno || "(sem nome)";

      // [3] Grau / Tipo
      linha.insertCell().textContent = usuario.grau || usuario.tipo || "";

      // [4] Email / Contato
      linha.insertCell().textContent = usuario.email || usuario.whatsapp || usuario.telefone || "";
    });
  } catch (err) {
    console.error("[Relatório] Erro ao carregar usuários:", err);
  }
}

// Auto‑init (se desejar)
document.addEventListener("DOMContentLoaded", () => {
  // carregarRelatorio(); // descomente se quiser carregar aqui
});
