document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value;
  const whatsapp = form.whatsapp.value;
  const usuario = await window.api.loginUsuario(email, whatsapp);
  const msgEl = document.getElementById("mensagem-login");
  if (usuario) {
    msgEl.textContent = "Login bem-sucedido. Olá, " + usuario.nome + "!";
  } else {
    msgEl.textContent = "Usuário não encontrado.";
  }
});
