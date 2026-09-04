// passes.js
const form = document.getElementById('formPasse');
const input = document.getElementById('idAssistido');
const resultado = document.getElementById('resultado');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = input.value.trim();
  if (!id) return;

  resultado.textContent = 'Registrando...';

  try {
    const resposta = await window.api.passes.registrar(Number(id));

    if (resposta.ok) {
      resultado.innerHTML = `✅ Passe registrado (assistido #${id})<br>Tipo: <strong>${resposta.tipo}</strong> em ${resposta.data} às ${resposta.hora}`;
    } else {
      resultado.textContent = `❌ Erro ao registrar o passe.`;
    }
  } catch (err) {
    resultado.textContent = `❌ Falha de comunicação: ${err.message}`;
  }

  input.value = '';
  input.focus();
});
