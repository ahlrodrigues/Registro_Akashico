// ============================================
// Caminho: frontend/scripts/relatorio.js
// Objetivo: Lógica do relatório (lista, busca, seleção, modal, salvar, excluir, imprimir)
// Nota: “Apelido” usa nomeSocial do banco.
// ============================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function norm(s) {
  return (s ?? "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

let usuarios = [];
let selecionados = new Set();

async function listarUsuarios() {
  try {
    if (window.api?.usuarios?.listar) return await window.api.usuarios.listar();
    if (window.api?.listarUsuarios)    return await window.api.listarUsuarios();
    if (window.api?.invoke)            return await window.api.invoke("usuario:listar");
    console.warn("⚠️ Nenhuma função para listar usuários encontrada.");
    return [];
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    return [];
  }
}

async function atualizarUsuario(payload) {
  try {
    const dados = { ...payload, nomeSocial: payload.apelido ?? "" };
    delete dados.apelido;

    if (window.api?.usuarios?.atualizar) return await window.api.usuarios.atualizar(dados);
    if (window.api?.atualizarUsuario)    return await window.api.atualizarUsuario(dados);
    if (window.api?.invoke)              return await window.api.invoke("usuario:atualizar", dados);
    throw new Error("Sem função para atualizar usuário no preload.");
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    throw err;
  }
}

async function excluirUsuario(id) {
  try {
    if (window.api?.usuarios?.excluir) return await window.api.usuarios.excluir(id);
    if (window.api?.excluirUsuario)    return await window.api.excluirUsuario(id);
    if (window.api?.invoke)            return await window.api.invoke("usuario:excluir", id);
    throw new Error("Sem função para excluir usuário no preload.");
  } catch (err) {
    console.error("Erro ao excluir usuário:", err);
    throw err;
  }
}

async function buscarPresencas(id) {
  try {
    if (window.api?.presencas?.listarPorUsuario) return await window.api.presencas.listarPorUsuario(id);
    if (window.api?.invoke)                      return await window.api.invoke("presencas:listarPorUsuario", id);
    return [];
  } catch { return []; }
}
async function buscarPasses(id) {
  try {
    if (window.api?.passes?.listarPorAssistido) return await window.api.passes.listarPorAssistido(id);
    if (window.api?.passes?.buscarPorAssistido) return await window.api.passes.buscarPorAssistido(id);
    if (window.api?.invoke)                     return await window.api.invoke("passes:buscarPorAssistido", id);
    return [];
  } catch { return []; }
}

function cel(texto) {
  const td = document.createElement("td");
  td.textContent = texto ?? "";
  return td;
}

function formatarDataParaInput(valor) {
  if (!valor) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(valor);
  if (iso) return iso[0];
  const partes = valor.split("/");
  if (partes.length === 3) {
    const [dia, mes, ano] = partes;
    if (ano?.length === 4) {
      return `${ano.padStart(4, "0")}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }
  }
  return valor;
}

function renderTabela(lista) {
  const tbody = $("#tabelaUsuarios tbody");
  tbody.innerHTML = "";

  for (const u of lista) {
    const tr = document.createElement("tr");

    const tdSel = document.createElement("td");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.dataset.id = u.id;
    cb.checked = selecionados.has(u.id);
    cb.addEventListener("change", (e) => {
      const id = Number(e.target.dataset.id);

      if (e.target.checked) {
        selecionados.clear();
        selecionados.add(id);
        $$("#tabelaUsuarios tbody input[type='checkbox']").forEach((outro) => {
          if (outro !== e.target) outro.checked = false;
        });
      } else {
        selecionados.delete(id);
      }

      atualizarBotoes();
    });
    tdSel.appendChild(cb);

    const valores = [
      u.id,
      u.nomeCompleto ?? "",
      u.nomeSocial ?? "",
      u.dataNascimento ?? "",
      u.cep ?? "",
      u.logradouro ?? "",
      u.numero ?? "",
      u.bairro ?? "",
      u.cidade ?? "",
      u.estado ?? "",
      u.telefone ?? "",
      u.email ?? "",
      u.redeSocial ?? "",
      u.status ?? "",
    ];

    tr.append(tdSel, ...valores.map(cel));
    tbody.appendChild(tr);
  }
}

function aplicarBusca() {
  const termo = norm($("#busca").value);
  if (!termo) { renderTabela(usuarios); return; }
  const filtrados = usuarios.filter((u) => {
    const alvo = [
      u.id,
      u.nomeCompleto,
      u.nomeSocial,
      u.dataNascimento,
      u.cep,
      u.logradouro,
      u.numero,
      u.bairro,
      u.cidade,
      u.estado,
      u.telefone,
      u.email,
      u.redeSocial,
      u.status,
    ].join(" ");
    return norm(alvo).includes(termo);
  });
  renderTabela(filtrados);
}

function atualizarBotoes() {
  const qnt = selecionados.size;
  $("#btnVer").disabled = qnt !== 1;
  $("#btnImprimirPasse").disabled = qnt !== 1;
}

function toggleSelecionarTodos(e) {
  const marcar = e.target.checked;

  selecionados.clear();
  $$("#tabelaUsuarios tbody input[type='checkbox']").forEach((cb, index) => {
    const id = Number(cb.dataset.id);
    if (marcar && index === 0) {
      cb.checked = true;
      selecionados.add(id);
    } else {
      cb.checked = false;
    }
  });

  if (!marcar) e.target.checked = false;

  atualizarBotoes();
}

function abrirModalEdicao(usuario) {
  $("#usuarioId").value = usuario.id;
  $("#nome").value = usuario.nomeCompleto ?? "";
  $("#apelido").value = usuario.nomeSocial ?? "";
  $("#dataNascimento").value = formatarDataParaInput(usuario.dataNascimento);
  $("#cep").value = usuario.cep ?? "";
  $("#logradouro").value = usuario.logradouro ?? "";
  $("#numero").value = usuario.numero ?? "";
  $("#bairro").value = usuario.bairro ?? "";
  $("#cidade").value = usuario.cidade ?? "";
  $("#estado").value = usuario.estado ?? "";
  $("#telefone").value = usuario.telefone ?? "";
  $("#email").value = usuario.email ?? "";
  $("#redeSocial").value = usuario.redeSocial ?? "";
  $("#status").value = usuario.status ?? "ativo";

  carregarRelatoriosAuxiliares(usuario.id);
  $("#modalCadastroUsuario").classList.remove("hidden");
}

function fecharModal() {
  $("#modalCadastroUsuario").classList.add("hidden");
  $("#formEditarUsuario").reset();
  $("#usuarioId").value = "";
  $("#relatorioPresencas").innerHTML = "";
  $("#relatorioPasses").innerHTML = "";
  $("#relatoriosExtras").classList.add("hidden");
}

async function carregarRelatoriosAuxiliares(idUsuario) {
  const [pres, pass] = await Promise.all([buscarPresencas(idUsuario), buscarPasses(idUsuario)]);

  $("#relatorioPresencas").innerHTML =
    Array.isArray(pres) && pres.length
      ? `<ul>${pres.map(p => `<li>${p.data} — ${p.presente ? "Presente" : "Ausente"}</li>`).join("")}</ul>`
      : `<em>Nenhuma presença encontrada.</em>`;

  $("#relatorioPasses").innerHTML =
    Array.isArray(pass) && pass.length
      ? `<ul>${pass.map(p => `<li>${p.data} ${p.hora ? `- ${p.hora}` : ""} — ${p.tipo ?? ""}</li>`).join("")}</ul>`
      : `<em>Nenhum passe encontrado.</em>`;

  $("#relatoriosExtras").classList.remove("hidden");
}

async function init() {
  usuarios = await listarUsuarios();
  renderTabela(usuarios);
  atualizarBotoes();

  $("#busca").addEventListener("input", aplicarBusca);
  $("#selecionarTodos").addEventListener("change", toggleSelecionarTodos);

  $("#btnVer").addEventListener("click", () => {
    if (selecionados.size !== 1) return;
    const id = [...selecionados][0];
    const usuario = usuarios.find(u => Number(u.id) === Number(id));
    if (usuario) abrirModalEdicao(usuario);
  });

  $("#btnFecharModal").addEventListener("click", fecharModal);

  $("#formEditarUsuario").addEventListener("submit", async (e) => {
    e.preventDefault();
    const textoOuNulo = (sel) => {
      const valor = $(sel).value.trim();
      return valor.length ? valor : null;
    };
    const payload = {
      id: Number($("#usuarioId").value),
      nomeCompleto: $("#nome").value.trim(),
      apelido: $("#apelido").value.trim(), // mapeado para nomeSocial
      dataNascimento: $("#dataNascimento").value || null,
      cep: textoOuNulo("#cep"),
      logradouro: textoOuNulo("#logradouro"),
      numero: textoOuNulo("#numero"),
      bairro: textoOuNulo("#bairro"),
      cidade: textoOuNulo("#cidade"),
      estado: textoOuNulo("#estado"),
      telefone: textoOuNulo("#telefone"),
      email: textoOuNulo("#email"),
      redeSocial: textoOuNulo("#redeSocial"),
      status: $("#status").value
    };

    try {
      await atualizarUsuario(payload);
      const idx = usuarios.findIndex(u => Number(u.id) === payload.id);
      if (idx >= 0) {
        usuarios[idx] = {
          ...usuarios[idx],
          nomeCompleto: payload.nomeCompleto,
          nomeSocial: payload.apelido,
          dataNascimento: payload.dataNascimento,
          cep: payload.cep,
          logradouro: payload.logradouro,
          numero: payload.numero,
          bairro: payload.bairro,
          cidade: payload.cidade,
          estado: payload.estado,
          telefone: payload.telefone,
          email: payload.email,
          redeSocial: payload.redeSocial,
          status: payload.status
        };
      }
      aplicarBusca();
      fecharModal();
    } catch (err) {
      alert("Erro ao salvar alterações. Ver console.");
      console.error(err);
    }
  });

  $("#btnExcluir")?.addEventListener("click", async () => {
    const id = Number($("#usuarioId").value);
    if (!id) return;
    if (!confirm("Tem certeza que deseja excluir este cadastro?")) return;
    try {
      await excluirUsuario(id);
      usuarios = usuarios.filter(u => Number(u.id) !== Number(id));
      selecionados.delete(id);
      aplicarBusca();
      fecharModal();
    } catch (err) {
      alert("Erro ao excluir. Ver console.");
      console.error(err);
    }
  });

  $("#btnImprimirPasse").addEventListener("click", async () => {
    const ids = [...selecionados];
    if (ids.length === 0) return;
    try {
      if (window.api?.passes?.imprimirParaUsuarios) {
        await window.api.passes.imprimirParaUsuarios(ids);
      } else if (window.api?.invoke) {
        await window.api.invoke("passes:imprimirParaUsuarios", ids);
      } else {
        alert("A função de imprimir passe não está disponível.");
      }
    } catch (err) {
      alert("Erro ao imprimir passes. Ver console.");
      console.error(err);
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
