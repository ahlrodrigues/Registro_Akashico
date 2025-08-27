// Caminho: scripts/incluirComponentes.js

export async function carregarComponente(id, arquivo) {
  const container = document.getElementById(id);
  if (container) {
    try {
      const response = await fetch(`../components/${arquivo}`);
      const html = await response.text();
      container.innerHTML = html;

      if (id === "rodape-container") {
        const anoInicial = 2025;
        const anoAtual = new Date().getFullYear();
        const texto = `© ${anoInicial}${anoAtual > anoInicial ? ' – ' + anoAtual : ''} Aliança Espírita Evangélica – Todos os direitos reservados`;
        const direitosEl = document.getElementById("direitos");
        if (direitosEl) direitosEl.textContent = texto;
      }
    } catch (erro) {
      console.error(`Erro ao carregar ${arquivo}:`, erro);
    }
  }
}

// ✅ Aguarda o DOM estar pronto antes de carregar os componentes
document.addEventListener("DOMContentLoaded", () => {
  carregarComponente("cabecalho-container", "cabecalho.html");
  carregarComponente("rodape-container", "rodape.html");
});
