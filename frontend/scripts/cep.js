// ============================================
// Caminho: frontend/scripts/cep.js
// Objetivo: Buscar endereço pelo CEP (ViaCEP) e normalizar/máscara
// Notas:
// - Sem dependências externas
// - Cache simples em memória para evitar requisições repetidas
// - Retorna objeto padronizado { logradouro, bairro, localidade, uf }
// ============================================

/** Cache em memória para respostas de CEP */
const cacheCep = new Map();

/**
 * Remove tudo que não for dígito e aplica máscara 00000-000
 * @param {string} raw
 * @returns {string}
 */
export function mascararCep(raw) {
  const n = (raw || "").replace(/\D/g, "").slice(0, 8);
  return n.length > 5 ? `${n.slice(0,5)}-${n.slice(5)}` : n;
}

/**
 * Valida CEP no formato 00000-000 ou 00000000
 * @param {string} cep
 * @returns {boolean}
 */
export function cepValido(cep) {
  return /^\d{5}-?\d{3}$/.test(cep || "");
}

/**
 * Normaliza para 8 dígitos (sem hífen)
 * @param {string} cep
 * @returns {string}
 */
export function cepSomenteDigitos(cep) {
  return (cep || "").replace(/\D/g, "").slice(0, 8);
}

/**
 * Busca endereço no ViaCEP (https://viacep.com.br/)
 * @param {string} cep - aceita com ou sem hífen
 * @returns {Promise<{logradouro:string,bairro:string,localidade:string,uf:string}|null>}
 */
export async function buscarEnderecoPorCep(cep) {
  const limpo = cepSomenteDigitos(cep);
  if (limpo.length !== 8) return null;

  // Cache
  if (cacheCep.has(limpo)) return cacheCep.get(limpo);

  const url = `https://viacep.com.br/ws/${limpo}/json/`;

  try {
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (data?.erro) {
      cacheCep.set(limpo, null);
      return null;
    }

    const resultado = {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      localidade: data.localidade || "",
      uf: data.uf || ""
    };

    cacheCep.set(limpo, resultado);
    return resultado;
  } catch (err) {
    console.error("[cep] Falha ao buscar CEP:", err);
    return null;
  }
}
