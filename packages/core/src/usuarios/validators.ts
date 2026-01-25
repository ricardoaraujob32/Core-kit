// packages/core/src/usuarios/validators.ts

export function nomeValido(nome: string): boolean {
  const n = nome.trim();
  return n.length >= 3 && n.length <= 120;
}

export function normalizeNome(nome: string): string {
  return nome.trim().replace(/\s+/g, " ");
}
