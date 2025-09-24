// ============================================
// Caminho: frontend/scripts/popularDb.js
// Objetivo: Popular o banco com dados de exemplo (dev)
// Alinhado ao schema atual de "usuarios":
// id, nomeCompleto, nomeSocial, dataNascimento, cep, logradouro, numero,
// bairro, cidade, estado, telefone, email, redeSocial, status
// ============================================

async function popularUsuariosDev() {
  try {
    const usuariosSeed = [
      { nomeCompleto: "João da Luz",  nomeSocial: "Joãozinho",  telefone: "11988887777", email: "joao@example.com",  status: "ativo" },
      { nomeCompleto: "Maria Clara",  nomeSocial: "Clarinha",   telefone: "11977776666", email: "maria@example.com", status: "ativo" },
      { nomeCompleto: "Pedro Auxiliado", nomeSocial: "Pedrinho", telefone: "11999994444", email: "pedro@example.com", status: "ativo" },
      { nomeCompleto: "Ana Luz",      nomeSocial: "Aninha",     telefone: "11911112222", email: "ana@example.com",   status: "ativo" },
    ];

    if (window.api?.usuarios?.seed) {
      return await window.api.usuarios.seed(usuariosSeed);
    }
    if (window.api?.invoke) {
      for (const u of usuariosSeed) await window.api.invoke("usuario:cadastrar", u);
      return { ok: true, total: usuariosSeed.length };
    }
    throw new Error("Nenhuma função de seed/cadastro disponível pelo preload.");
  } catch (e) {
    console.error("Erro ao popular usuários DEV:", e);
    return { ok: false, erro: String(e) };
  }
}

window.popularUsuariosDev = popularUsuariosDev;
