// ==============================================
// PATH: frontend/js/calendarioPresencas.js
// ==============================================

/**
 * Calendário de Presenças (Renderer)
 * - NÃO usa window.require (contextIsolation: true)
 * - Usa window.api.* (expostos no preload)
 * - Exporta funções públicas para integração:
 *   - carregarPresencasDoMes(assistidoId, ano, mes)
 *   - marcarPresenca(assistidoId, dataISO)
 *   - desmarcarPresenca(assistidoId, dataISO)
 *   - renderizarCalendario(container, estado)  <-- exportado p/ compat
 *   - carregarMesEAtualizar(estado, atualizaUI) <-- util p/ recarregar mês
 */

// ===== Utilidades simples (i18n pode substituir) =====
function obterNomeMes(idxMes1a12) {
  const fallback = [
    "janeiro","fevereiro","março","abril","maio","junho",
    "julho","agosto","setembro","outubro","novembro","dezembro",
  ];
  return fallback[idxMes1a12 - 1] || String(idxMes1a12);
}

function formatarISO(ano, mes1a12, dia) {
  const m = String(mes1a12).padStart(2, "0");
  const d = String(dia).padStart(2, "0");
  return `${ano}-${m}-${d}`;
}

// ===== API com o backend via preload =====
export async function carregarPresencasDoMes(assistidoId, ano, mes) {
  const resp = await window.api.buscarPresencas(assistidoId, ano, mes);
  if (!resp?.sucesso) throw new Error(resp?.erro || "Falha ao buscar presenças.");
  return resp.dados; // [{ data: "YYYY-MM-DD", hora: "HH:MM" }, ...]
}

export async function marcarPresenca(assistidoId, dataISO) {
  const resp = await window.api.adicionarPresenca(assistidoId, dataISO);
  if (!resp?.sucesso) throw new Error(resp?.erro || "Falha ao adicionar presença.");
  return true;
}

export async function desmarcarPresenca(assistidoId, dataISO) {
  const resp = await window.api.removerPresenca(assistidoId, dataISO);
  if (!resp?.sucesso) throw new Error(resp?.erro || "Falha ao remover presença.");
  return true;
}

/**
 * Renderiza o calendário em um container fornecido.
 * @param {HTMLElement} container - elemento que contém #calTitle e #calGrid
 * @param {Object} estado - { assistidoId, ano, mes, presencasSet, onToggle? }
 *   - presencasSet: Set<string> com datas ISO "YYYY-MM-DD"
 *   - onToggle: (iso, temAntes:boolean)=>Promise<boolean>   // opcional callback
 */
export function renderizarCalendario(container, estado) {
  const calTitle = container.querySelector("#calTitle");
  const calGrid = container.querySelector("#calGrid");
  const { ano, mes, presencasSet } = estado;

  if (!calTitle || !calGrid) {
    console.warn("[Calendário] Container inválido: faltam #calTitle ou #calGrid");
    return;
  }

  // Título
  calTitle.textContent = `${obterNomeMes(mes)} de ${ano}`;

  // Limpa grid
  calGrid.innerHTML = "";

  // Datas
  const primeiro = new Date(ano, mes - 1, 1);
  const offset = primeiro.getDay();          // 0=Dom..6=Sáb
  const totalDias = new Date(ano, mes, 0).getDate();

  // Espaços vazios antes do dia 1
  for (let i = 0; i < offset; i++) {
    const vazio = document.createElement("div");
    vazio.className = "cal-dia cal-dia--vazio";
    calGrid.appendChild(vazio);
  }

  // Dias do mês
  for (let dia = 1; dia <= totalDias; dia++) {
    const iso = formatarISO(ano, mes, dia);
    const cel = document.createElement("button");
    cel.className = "cal-dia";
    cel.type = "button";
    cel.dataset.date = iso;
    cel.textContent = String(dia);

    const presente = presencasSet?.has?.(iso);
    if (presente) {
      cel.classList.add("presente");
      cel.setAttribute("aria-pressed", "true");
      cel.title = "Presença registrada";
    } else {
      cel.setAttribute("aria-pressed", "false");
      cel.title = "Clique para marcar presença";
    }

    // Toggle presença
    cel.addEventListener("click", async () => {
      cel.disabled = true;
      try {
        let ok = false;
        if (typeof estado.onToggle === "function") {
          // Se o chamador fornecer um callback assíncrono, usamos
          ok = await estado.onToggle(iso, presente === true);
        } else {
          // Padrão: chama backend direto
          ok = !presente
            ? await marcarPresenca(estado.assistidoId, iso)
            : await desmarcarPresenca(estado.assistidoId, iso);
        }

        if (ok) {
          if (presente) {
            presencasSet.delete(iso);
            cel.classList.remove("presente");
            cel.setAttribute("aria-pressed", "false");
            cel.title = "Clique para marcar presença";
          } else {
            presencasSet.add(iso);
            cel.classList.add("presente");
            cel.setAttribute("aria-pressed", "true");
            cel.title = "Presença registrada";
          }
        }
      } catch (e) {
        console.error("[Calendário] onToggle falhou:", e);
      } finally {
        cel.disabled = false;
      }
    });

    calGrid.appendChild(cel);
  }
}

/**
 * Utilitário: carrega do backend e re-renderiza, chamando um callback de UI.
 * @param {Object} estado - { assistidoId, ano, mes, presencasSet }
 * @param {(novoSet:Set<string>)=>void} atualizaUI - callback que deve chamar renderizarCalendario(...)
 */
export async function carregarMesEAtualizar(estado, atualizaUI) {
  const lista = await carregarPresencasDoMes(estado.assistidoId, estado.ano, estado.mes);
  estado.presencasSet = new Set((lista || []).map((r) => r.data));
  if (typeof atualizaUI === "function") atualizaUI(estado.presencasSet);
}
