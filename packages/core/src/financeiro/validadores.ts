// packages/core/src/financeiro/validadores.ts
// Finalidade: Validadores do domínio Financeiro.

export function valorCentavosValido(valorCentavos: number): boolean {
  return Number.isInteger(valorCentavos) && valorCentavos > 0;
}

export function descricaoValida(descricao: string): boolean {
  return typeof descricao === "string" && descricao.trim().length >= 3;
}
