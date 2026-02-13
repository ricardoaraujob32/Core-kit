// packages/core/src/usuarios/validadores.ts

export function nomeValido(nome: string): boolean {
  const n = normalizarNome(nome).trim();
  return n.length >= 3 && n.length <= 120;
}

export function normalizarNome(nome: string): string {
  return nome.trim().replace(/\s+/g, " ");
}

