export async function carregarComponente(id, arquivo) {
  const container = document.getElementById(id);
  if (container) {
    const response = await fetch(`../components/${arquivo}`);
    const html = await response.text();
    container.innerHTML = html;

    // Se for o rodapé, atualiza o ano
    if (id === "rodape-container") {
      const anoInicial = 2025;
      const anoAtual = new Date().getFullYear();
      const texto = `© ${anoInicial}${anoAtual > anoInicial ? ' – ' + anoAtual : ''} Aliança Espírita Evangélica – Todos os direitos reservados`;
      const direitosEl = document.getElementById("direitos");
      if (direitosEl) direitosEl.textContent = texto;
    }
  }
}

carregarComponente("cabecalho-container", "cabecalho.html");
carregarComponente("rodape-container", "rodape.html");
