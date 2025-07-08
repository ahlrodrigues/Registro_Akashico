document.getElementById("form-cadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const mensagemEl = document.getElementById("mensagem");

  // Ao montar o objeto do novo usuário:
const novoUsuario = {
  id, // gerado no backend ou pelo banco
  nome: document.getElementById('nome').value,
  apelido: document.getElementById('apelido').value,
  grau: document.getElementById('grau').value,
  telefone: document.getElementById('telefone').value,
  email: document.getElementById('email').value,
  status: document.getElementById('status').value || 'ativo' // valor padrão
};

  try {
    // Chama o backend para salvar
    const id = await window.api.cadastrarUsuario(dados);

    // Mensagem de sucesso
    mensagemEl.textContent = `✅ Cadastro realizado com sucesso. ID: ${id}`;
    mensagemEl.style.color = "green";

    // Limpa o formulário e foca no primeiro campo
    form.reset();
    form.nome.focus();
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    mensagemEl.textContent = "❌ Erro ao cadastrar. Tente novamente.";
    mensagemEl.style.color = "red";
  }
});
