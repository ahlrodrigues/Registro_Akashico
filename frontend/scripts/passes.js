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
    const resposta = await window.electron.ipcRenderer.invoke('passes:registrar', Number(id));

    if (resposta.sucesso) {
      resultado.innerHTML = `✅ Passe registrado para <strong>${resposta.nome}</strong><br>Tipo: <strong>${resposta.tipoPasse}</strong>`;
    } else {
      resultado.textContent = `❌ Erro: ${resposta.erro}`;
    }
  } catch (err) {
    resultado.textContent = `❌ Falha de comunicação: ${err.message}`;
  }

  input.value = '';
  input.focus();
});
