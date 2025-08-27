// ============================================
// PATH: frontend/scripts/modalCadastroUsuario.js
// OBJ: Lógica do modal de cadastro/edição (novo schema)
// ============================================

const $  = (id) => document.getElementById(id);
const val = (id) => ($(id)?.value ?? "").trim();

/* ========= Mensagens no modal ========= */
function setModalMsg(tipo, texto) {
  const el = $("modalCadastroMsg");
  if (!el) return;
  el.innerHTML = `${texto} <button class="close-btn" type="button" id="modalMsgClose">Fechar</button>`;
  el.classList.remove("hidden", "ok", "erro", "warn", "info");
  el.classList.add(tipo);
  $("modalMsgClose")?.addEventListener("click", () => clearModalMsg());
}
function clearModalMsg() {
  const el = $("modalCadastroMsg");
  if (el) { el.textContent = ""; el.classList.add("hidden"); el.classList.remove("ok","erro","warn","info"); }
}

/* ========= CEP utils ========= */
function cepValido(cep) { return /^\d{5}-\d{3}$/.test(cep || ""); }
function normalizarCep(raw) {
  const n = (raw || "").replace(/\D/g, "").slice(0, 8);
  return n.length > 5 ? `${n.slice(0,5)}-${n.slice(5)}` : n;
}
function cepSomenteDigitos(cep) { return (cep || "").replace(/\D/g, "").slice(0,8); }

const cacheCep = new Map();
async function buscarEnderecoPorCep(cep) {
  const limpo = cepSomenteDigitos(cep);
  if (limpo.length !== 8) return null;
  if (cacheCep.has(limpo)) return cacheCep.get(limpo);
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data?.erro) { cacheCep.set(limpo, null); return null; }
    const out = { logradouro: data.logradouro||"", bairro: data.bairro||"", localidade: data.localidade||"", uf: data.uf||"" };
    cacheCep.set(limpo, out);
    return out;
  } catch (e) {
    console.error("[modalCadastro][CEP]", e);
    return null;
  }
}
function toggleEnderecoDisabled(disabled) {
  // não desabilita "numero" para o foco funcionar
  ["logradouro","bairro","cidade","estado"].forEach(id => { const el=$(id); if (el) el.disabled = disabled; });
}

/* ========= Referências ========= */
const modal = $("modalCadastroUsuario");
const form  = $("formEditarUsuario");
const btnFechar = $("btnFechar");
const btnExcluir = $("btnExcluir");

function abrirModal() {
  clearModalMsg();
  modal?.classList.remove("hidden");
  modal?.setAttribute("aria-hidden","false");
}
function fecharModal() {
  modal?.classList.add("hidden");
  modal?.setAttribute("aria-hidden","true");
}
btnFechar?.addEventListener("click", fecharModal);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModal(); });
modal?.addEventListener("click", (e) => { if (e.target.id === "modalCadastroUsuario") fecharModal(); });

/* ========= Preencher/Coletar ========= */
function setValue(id, v) { const el = $(id); if (el) el.value = v ?? ""; return !!el; }

function preencherForm(dados = {}) {
  const end = dados.endereco || {};
  const statusNorm = (dados.status === "desativado" || dados.status === "inativo") ? "desativado" : (dados.status || "ativo");

  setValue("usuarioId", dados.id ?? "");
  setValue("nomeCompleto", dados.nomeCompleto ?? dados.nome ?? "");
  setValue("nomeSocial",   dados.nomeSocial   ?? dados.apelido ?? "");
  setValue("dataNascimento", dados.dataNascimento ?? "");

  setValue("cep",        normalizarCep(end.cep ?? dados.cep ?? ""));
  setValue("logradouro", end.logradouro ?? dados.logradouro ?? "");
  setValue("numero",     end.numero     ?? dados.numero     ?? "");
  setValue("bairro",     end.bairro     ?? dados.bairro     ?? "");
  setValue("cidade",     end.cidade     ?? dados.cidade     ?? "");
  setValue("estado",     end.estado     ?? dados.estado     ?? "");

  setValue("telefone",   dados.telefone   ?? "");
  setValue("email",      dados.email      ?? "");
  setValue("redeSocial", dados.redeSocial ?? "");
  setValue("status",     statusNorm);

  btnExcluir?.classList.toggle("hidden", !dados.id);
  if (dados.id && btnExcluir) btnExcluir.dataset.id = String(dados.id);
}

function coletarPayloadDoForm() {
  return {
    nomeCompleto:   val("nomeCompleto"),
    nomeSocial:     val("nomeSocial"),
    dataNascimento: val("dataNascimento"),
    endereco: {
      cep:        normalizarCep(val("cep")),
      logradouro: val("logradouro"),
      numero:     val("numero"),
      bairro:     val("bairro"),
      cidade:     val("cidade"),
      estado:     val("estado"),
    },
    telefone:   val("telefone"),
    email:      val("email"),
    redeSocial: val("redeSocial"),
    status:     val("status") || "ativo"
  };
}

/* ========= CEP: máscara + ViaCEP + foco ========= */
$("cep")?.addEventListener("input", (ev) => { ev.target.value = normalizarCep(ev.target.value); });
$("cep")?.addEventListener("blur", tentarPreencherEnderecoPorCep);
$("cep")?.addEventListener("keyup", () => {
  if (cepSomenteDigitos($("cep").value).length === 8) tentarPreencherEnderecoPorCep();
});

let preenchendoCep = false;
async function tentarPreencherEnderecoPorCep() {
  if (preenchendoCep) return;
  const cepAtual = val("cep");
  if (!cepValido(cepAtual)) return;

  try {
    preenchendoCep = true;
    toggleEnderecoDisabled(true);
    const dados = await buscarEnderecoPorCep(cepAtual);
    if (!dados) return;

    if (!$("logradouro").value) $("logradouro").value = dados.logradouro;
    if (!$("bairro").value)     $("bairro").value     = dados.bairro;
    if (!$("cidade").value)     $("cidade").value     = dados.localidade;
    if (!$("estado").value)     $("estado").value     = dados.uf;
  } finally {
    toggleEnderecoDisabled(false);
    const numeroEl = $("numero");
    if (numeroEl) requestAnimationFrame(() => numeroEl.focus());
    preenchendoCep = false;
  }
}

/* ========= Máscara telefone ========= */
$("telefone")?.addEventListener("input", (ev) => {
  let n = (ev.target.value || "").replace(/\D/g, "").slice(0, 11);
  if (n.length >= 2 && n.length <= 6)       ev.target.value = `(${n.slice(0,2)}) ${n.slice(2)}`;
  else if (n.length > 6 && n.length <= 10)  ev.target.value = `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  else if (n.length === 11)                 ev.target.value = `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
  else                                      ev.target.value = n;
});

/* ========= API: abrir modal ========= */
async function abrirModalEditarUsuario(dadosOuId) {
  try {
    let dados = null;

    if (typeof dadosOuId === "number") {
      dados = await window.api.buscarUsuarioPorId(dadosOuId);
      if (!dados) throw new Error("Usuário não encontrado");
    } else if (typeof dadosOuId === "object" && dadosOuId !== null) {
      dados = dadosOuId;
    } else {
      dados = {};
    }

    preencherForm(dados || {});
    abrirModal();

    // Calendário (se existir globalmente)
    if (dados?.id && typeof window.renderizarCalendario === "function") {
      try { await window.renderizarCalendario(dados.id); } catch {}
    }
  } catch (erro) {
    console.error("[modalCadastro] erro ao abrir:", erro);
    setModalMsg("erro", "❌ Erro ao carregar dados.");
  }
}
window.abrirModalEditarUsuario = abrirModalEditarUsuario;

/* ========= Submit Salvar/Atualizar ========= */
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearModalMsg();

  const id = Number(val("usuarioId")) || null;
  const payload = coletarPayloadDoForm();

  // validações
  if (!payload.nomeCompleto)   return setModalMsg("erro", "❌ Informe o nome completo.");
  if (!payload.dataNascimento) return setModalMsg("erro", "❌ Informe a data de nascimento.");
  if (!cepValido(payload.endereco.cep)) return setModalMsg("erro", "❌ CEP inválido. Use 00000-000.");
  if (!payload.endereco.logradouro) return setModalMsg("erro", "❌ Informe a Rua/Av.");
  if (!payload.endereco.numero)     return setModalMsg("erro", "❌ Informe o número.");
  if (!payload.endereco.bairro)     return setModalMsg("erro", "❌ Informe o bairro.");
  if (!payload.endereco.cidade)     return setModalMsg("erro", "❌ Informe a cidade.");
  if (!payload.endereco.estado)     return setModalMsg("erro", "❌ Selecione o estado (UF).");

  try {
    if (id) {
      await window.api.atualizarUsuario({ id, ...payload });
      setModalMsg("ok", "✅ Cadastro atualizado com sucesso.");
    } else {
      const novoId = await window.api.cadastrarUsuario(payload);
      setValue("usuarioId", String(novoId));
      setModalMsg("ok", `✅ Cadastro criado com sucesso. ID: ${novoId}`);
      if (typeof window.renderizarCalendario === "function") {
        try { await window.renderizarCalendario(Number(novoId)); } catch {}
      }
    }
  } catch (error) {
    console.error("[modalCadastro] Erro ao salvar:", error);
    setModalMsg("erro", "❌ Erro ao salvar. Tente novamente.");
  }
});

/* ========= Excluir ========= */
btnExcluir?.addEventListener("click", async () => {
  clearModalMsg();
  const id = Number(val("usuarioId"));
  if (!id) return setModalMsg("warn", "⚠️ Nenhum usuário selecionado.");

  const confirmar = confirm("Tem certeza que deseja excluir este cadastro?");
  if (!confirmar) return;

  try {
    await window.api.excluirUsuario(id);
    setModalMsg("ok", "✅ Cadastro excluído.");
    form?.reset();
    setValue("usuarioId", "");
  } catch (error) {
    console.error("[modalCadastro] Erro ao excluir:", error);
    setModalMsg("erro", "❌ Não foi possível excluir. Tente novamente.");
  }
});

