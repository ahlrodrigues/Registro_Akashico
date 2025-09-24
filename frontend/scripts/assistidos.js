// ============================================
// Caminho: frontend/scripts/assistidos.js
// Objetivo: Listagem de assistidos (sem coluna adicional)
// Notas:
// - "Apelido" exibe nomeSocial (banco)
// - Compatível com múltiplas exposições no preload
// ============================================

/* Helpers DOM */
const $ = (sel) => document.querySelector(sel);

/* Bridge: tenta múltiplas exposições do preload */
async function listarUsuarios() {
  try {
    if (window.api?.usuarios?.listar) return await window.api.usuarios.listar();
    if (window.api?.listarUsuarios)    return await window.api.listarUsuarios();
    if (window.api?.invoke)            return await window.api.invoke("usuario:listar");
    console.warn("⚠️ Nenhuma função para listar usuários encontrada.");
    return [];
  } catch (e) {
    console.error("Erro ao listar usuários:", e);
    return [];
  }
}

/* Render da tabela */
function renderTabela(usuarios) {
  const tbody = $("#tabelaAssistidos tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  for (const u of (usuarios || [])) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id ?? ""}</td>
      <td>${u.nomeCompleto ?? ""}</td>
      <td>${u.nomeSocial ?? "-"}</td>   <!-- Apelido = nomeSocial -->
      <td>${u.telefone ?? "-"}</td>
      <td>${u.email ?? "-"}</td>
      <td>${u.status ?? "-"}</td>
    `;
    tbody.appendChild(tr);
  }
}

/* Init */
document.addEventListener("DOMContentLoaded", async () => {
  const lista = await listarUsuarios();
  renderTabela(lista);
});
