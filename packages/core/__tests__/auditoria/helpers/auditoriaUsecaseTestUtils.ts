// packages/core/__tests__/auditoria/helpers/auditoriaUsecaseTestUtils.ts

export const DATA_TESTE = new Date("2026-03-12T10:00:00.000Z");

export function ids<T extends { auditoriaId: string }>(itens: T[]) {
  return itens.map((item) => item.auditoriaId);
}
