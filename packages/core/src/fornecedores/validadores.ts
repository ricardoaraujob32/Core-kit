// packages/core/src/fornecedores/validadores.ts
// Finalidade: Normalização/validação de campos de Fornecedores.

export function normalizarNomeFornecedor(nome: string): string {
  return String(nome ?? "").trim().replace(/\s+/g, " ");
}

export function nomeFornecedorValido(nome: string): boolean {
  const n = normalizarNomeFornecedor(nome);
  return n.length >= 3 && n.length <= 120;
}

export function emailValidoOpcional(email?: string): boolean {
  if (email === undefined) return true;
  const e = String(email).trim();
  if (e.length === 0) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
