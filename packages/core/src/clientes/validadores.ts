// packages/core/src/clientes/validadores.ts
// Finalidade: Normalização/validação de campos de Clientes.

export function normalizarNomeCliente(nome: string): string {
  return String(nome ?? "").trim().replace(/\s+/g, " ");
}

export function nomeClienteValido(nome: string): boolean {
  const n = normalizarNomeCliente(nome);
  return n.length >= 3 && n.length <= 120;
}

export function emailValidoOpcional(email?: string): boolean {
  if (email === undefined) return true;
  const e = String(email).trim();
  if (e.length === 0) return false;

  // regex simples (boa p/ MVP). Podemos endurecer depois.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
