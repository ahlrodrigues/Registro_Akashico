// ============================================
// PATH: frontend/scripts/modalAviso.js
// OBJ: Controlar modal de aviso (sucesso/erro/warn/info)
// ============================================

const $ = (id) => document.getElementById(id);

function setMsg(tipo, titulo, mensagem, detalhesHtml) {
  const tituloEl = $("modalAvisoTitulo");
  const msgEl    = $("modalAvisoMsg");
  const detEl    = $("modalAvisoDetalhes");

  if (tituloEl) tituloEl.textContent = titulo || "Aviso";
  if (msgEl) {
    msgEl.className = "modal-msg"; // reset
    msgEl.classList.add(tipo || "info");
    msgEl.classList.remove("hidden");
    msgEl.textContent = mensagem || "";
  }
  if (detEl) {
    if (detalhesHtml) {
      detEl.innerHTML = detalhesHtml;
      detEl.classList.remove("hidden");
    } else {
      detEl.innerHTML = "";
      detEl.classList.add("hidden");
    }
  }
}

function abrir() {
  const modal = $("modalAviso");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  // foco acessível
  $("modalAvisoBtnFechar")?.focus();
}

function fechar() {
  const modal = $("modalAviso");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function onEsc(e) {
  if (e.key === "Escape") fechar();
}

// listeners
document.addEventListener("DOMContentLoaded", () => {
  $("modalAvisoBtnFechar")?.addEventListener("click", fechar);
  document.addEventListener("keydown", onEsc);
  $("modalAviso")?.addEventListener("click", (e) => {
    if (e.target.id === "modalAviso") fechar();
  });
});

// API pública
function show(tipo, { titulo, mensagem, detalhesHtml } = {}) {
  setMsg(tipo, titulo, mensagem, detalhesHtml);
  abrir();
}
function sucesso(opts) { show("ok",   opts); }
function erro(opts)    { show("erro", opts); }
function warn(opts)    { show("warn", opts); }
function info(opts)    { show("info", opts); }

window.modalAviso = { abrir, fechar, show, sucesso, erro, warn, info };
