
export function formatFinanceiroLabel(item: any): string {
  return `${item.descricao ?? item.tipo ?? "Conta"} — ${item.valor ?? ""}`;
}
