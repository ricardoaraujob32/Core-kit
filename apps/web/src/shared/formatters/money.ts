// apps/web/src/shared/formatters/money.ts

export function formatMoney(value?: number | string | null): string {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
