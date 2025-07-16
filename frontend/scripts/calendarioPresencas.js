// calendarioPresencas.js
const { ipcRenderer } = window.require("electron");

let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
let assistidoIdAtual = null;
let presencas = [];

export async function renderizarCalendario(assistidoId, ano = anoAtual, mes = mesAtual) {
  assistidoIdAtual = assistidoId;
  anoAtual = ano;
  mesAtual = mes;

  presencas = await obterPresencasDoBanco(assistidoIdAtual, anoAtual, mesAtual);

  const corpo = document.getElementById("corpo-calendario");
  const titulo = document.getElementById("mes-ano-atual");

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  titulo.textContent = `${nomesMeses[mesAtual]} ${anoAtual}`;
  corpo.innerHTML = "";

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

  let linha = document.createElement("tr");

  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement("td");
    vazio.classList.add("vazio");
    linha.appendChild(vazio);
  }

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const td = document.createElement("td");
    td.textContent = dia;

    const presenca = presencas.find(p => p.data === dataStr);

    if (presenca) {
      td.classList.add("presente");
      td.setAttribute("data-tooltip", `Presente às ${presenca.hora || '---'}`);
    } else {
      td.classList.add("ausente");
      td.setAttribute("data-tooltip", "Ausente");
    }

    td.addEventListener("click", async () => {
      if (td.classList.contains("presente")) {
        await ipcRenderer.invoke("presencas:remover", {
          assistidoId: assistidoIdAtual,
          data: dataStr,
        });
      } else {
        await ipcRenderer.invoke("presencas:adicionar", {
          assistidoId: assistidoIdAtual,
          data: dataStr,
        });
      }
      renderizarCalendario(assistidoIdAtual, anoAtual, mesAtual);
    });

    linha.appendChild(td);

    if ((primeiroDia + dia) % 7 === 0 || dia === diasNoMes) {
      corpo.appendChild(linha);
      linha = document.createElement("tr");
    }
  }
}

document.getElementById("mes-anterior").addEventListener("click", () => {
  mesAtual--;
  if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  }
  renderizarCalendario(assistidoIdAtual, anoAtual, mesAtual);
});

document.getElementById("mes-seguinte").addEventListener("click", () => {
  mesAtual++;
  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  }
  renderizarCalendario(assistidoIdAtual, anoAtual, mesAtual);
});

// 🔌 IPC: obter presenças do banco
async function obterPresencasDoBanco(assistidoId, ano, mes) {
  const retorno = await ipcRenderer.invoke("presencas:buscar", {
    assistidoId,
    ano,
    mes: mes + 1 // mês 1-12
  });

  // Exemplo de retorno esperado:
  // [{ data: "2025-07-03", hora: "19:04" }, ...]
  return retorno || [];
}
