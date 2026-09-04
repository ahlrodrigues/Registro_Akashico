document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value;
  const whatsapp = form.whatsapp.value;
  const usuario = await window.api.usuarios.login(email, whatsapp);
  const msgEl = document.getElementById("mensagem-login");
  if (usuario) {
    msgEl.textContent = "Login bem-sucedido. Olá, " + usuario.nomeCompleto + "!";
  } else {
    msgEl.textContent = "Usuário não encontrado.";
  }
});
