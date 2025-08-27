// ============================================
// Caminho: frontend/scripts/cadastro.js
// Objetivo: Cadastro + autofill por CEP (ViaCEP)
// Notas:
// - Não exibe mensagens abaixo do form.
// - SUCESSO/ERRO: usa window.modalAviso (ou alert fallback).
// - CEP: máscara 00000-000; foco no campo "Número" após preencher.
// Requisitos na página:
// - Incluir o HTML do modalAviso e carregar ../scripts/modalAviso.js ANTES deste arquivo.
// ============================================

/* -----------------------------
   Helpers / Util
------------------------------*/
const $  = (id) => document.getElementById(id);
const val = (id) => ($(id)?.value ?? "").trim();

/* -----------------------------
   CEP utils
------------------------------*/
function cepValido(cep) { return /^\d{5}-\d{3}$/.test(cep || ""); }

function normalizarCep(raw) {
  const n = (raw || "").replace(/\D/g, "").slice(0, 8);
  return n.length > 5 ? `${n.slice(0,5)}-${n.slice(5)}` : n;
}

function cepSomenteDigitos(cep) {
  return (cep || "").replace(/\D/g, "").slice(0, 8);
}

/* -----------------------------
   ViaCEP (com cache)
------------------------------*/
const cacheCep = new Map();

async function buscarEnderecoPorCep(cep) {
  const limpo = cepSomenteDigitos(cep);
  if (limpo.length !== 8) return null;

  if (cacheCep.has(limpo)) return cacheCep.get(limpo);

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (data?.erro) {
      cacheCep.set(limpo, null);
      return null;
    }

    const resultado = {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      localidade: data.localidade || "",
      uf: data.uf || ""
    };
    cacheCep.set(limpo, resultado);
    return resultado;
  } catch (err) {
    console.error("[cadastro][CEP] Falha ao buscar CEP:", err);
    return null;
  }
}

/* Desabilita/habilita campos de endereço (exceto número para manter foco possível) */
function toggleEnderecoDisabled(disabled) {
  ["logradouro", "bairro", "cidade", "estado"].forEach((id) => {
    const el = $(id);
    if (el) el.disabled = disabled;
  });
}

/* -----------------------------
   Comportamentos da tela
------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  const form = $("form-cadastro");
  if (!form) {
    console.warn("[cadastro] Formulário não encontrado: #form-cadastro");
    return;
  }

  const elCep = $("cep");

  // Máscara de CEP (00000-000)
  elCep?.addEventListener("input", (ev) => {
    ev.target.value = normalizarCep(ev.target.value);
  });

  // Dispara ViaCEP ao sair do campo ou ao completar 8 dígitos
  elCep?.addEventListener("blur", tentarPreencherEnderecoPorCep);
  elCep?.addEventListener("keyup", () => {
    if (cepSomenteDigitos(elCep.value).length === 8) {
      tentarPreencherEnderecoPorCep();
    }
  });

  // Máscara simples de telefone
  $("telefone")?.addEventListener("input", (ev) => {
    let n = (ev.target.value || "").replace(/\D/g, "").slice(0, 11);
    if (n.length >= 2 && n.length <= 6) {
      ev.target.value = `(${n.slice(0,2)}) ${n.slice(2)}`;
    } else if (n.length > 6 && n.length <= 10) {
      ev.target.value = `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
    } else if (n.length === 11) {
      ev.target.value = `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
    } else {
      ev.target.value = n;
    }
  });

  // ViaCEP + foco no número
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
    } catch (e) {
      console.error("[cadastro][CEP]", e);
    } finally {
      toggleEnderecoDisabled(false);
      const numeroEl = $("numero");
      if (numeroEl) {
        // Foco garantido após reabilitar campos
        requestAnimationFrame(() => numeroEl.focus());
      }
      preenchendoCep = false;
    }
  }

  /* -----------------------------
     Submit do formulário
  ------------------------------*/
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Coleta dos campos
    const nomeCompleto   = val("nomeCompleto");
    const nomeSocial     = val("nomeSocial");
    const dataNascimento = val("dataNascimento");
    const cep            = normalizarCep(val("cep"));
    const logradouro     = val("logradouro");
    const numero         = val("numero");
    const bairro         = val("bairro");
    const cidade         = val("cidade");
    const estado         = val("estado");
    const telefone       = val("telefone");
    const email          = val("email");
    const redeSocial     = val("redeSocial");
    const status         = val("status") || "ativo";

    // Validações mínimas (UX silenciosa: apenas foco no campo)
    if (!nomeCompleto)   { $("nomeCompleto")?.focus(); return; }
    if (!dataNascimento) { $("dataNascimento")?.focus(); return; }
    if (!cepValido(cep)) { $("cep")?.focus(); return; }
    if (!logradouro)     { $("logradouro")?.focus(); return; }
    if (!numero)         { $("numero")?.focus(); return; }
    if (!bairro)         { $("bairro")?.focus(); return; }
    if (!cidade)         { $("cidade")?.focus(); return; }
    if (!estado)         { $("estado")?.focus(); return; }

    // Payload para o backend
    const novoUsuario = {
      nomeCompleto,
      nomeSocial,
      dataNascimento,
      endereco: { cep, logradouro, numero, bairro, cidade, estado },
      telefone,
      email,
      redeSocial,
      status
    };

    try {
      // Salva no backend e obtém o ID
      const novoId = await window.api.cadastrarUsuario(novoUsuario);

      // Modal de SUCESSO (modalAviso)
      if (window.modalAviso?.sucesso) {
        window.modalAviso.sucesso({
          titulo: "Cadastro realizado",
          mensagem: "✅ Cadastro realizado com sucesso.",
          detalhesHtml: `<small>ID: <strong>${novoId}</strong></small>`
        });
      } else {
        alert(`Cadastro realizado com sucesso. ID: ${novoId}`);
      }

      // Limpa o formulário para o próximo cadastro
      form.reset();
      $("nomeCompleto")?.focus();

    } catch (err) {
      console.error("[cadastro] Erro ao cadastrar:", err);
      if (window.modalAviso?.erro) {
        window.modalAviso.erro({
          titulo: "Erro no cadastro",
          mensagem: "❌ Não foi possível concluir o cadastro.",
          detalhesHtml: `<small>${err?.message || "Tente novamente."}</small>`
        });
      } else {
        alert("Erro ao cadastrar. Tente novamente.");
      }
    }
  });
});
