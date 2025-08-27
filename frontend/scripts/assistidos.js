// frontend/scripts/assistidos.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
      // Chama o handler do backend via IPC
      const assistidos = await window.api.listarAssistidos();
  
      const tbody = document.querySelector('#assistidos tbody');
      assistidos.forEach(assistido => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${assistido.nome}</td>
          <td>${assistido.grau || '-'}</td>
          <td>${assistido.funcao || assistido.observacoes || '-'}</td>
        `;
        tbody.appendChild(tr);
      });
  
      // Inicializa DataTables
      new DataTable('#assistidos');
    } catch (erro) {
      console.error('Erro ao carregar assistidos:', erro);
    }
  });
  