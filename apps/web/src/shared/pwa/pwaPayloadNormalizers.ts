// apps/web/src/shared/pwa/pwaPayloadNormalizers.ts

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown): string | null {
  const trimmed = text(value);
  return trimmed ? trimmed : null;
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function positiveNumber(value: unknown, fallback = 1): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function normalizeClientePayload(payload: Record<string, unknown>) {
  return {
    nome: text(payload.nome),
    documento: nullableText(payload.documento),
    email: nullableText(payload.email),
    telefone: nullableText(payload.telefone),
  };
}

export function normalizeFornecedorPayload(payload: Record<string, unknown>) {
  return {
    nome: text(payload.nome),
    documento: nullableText(payload.documento),
    email: nullableText(payload.email),
    telefone: nullableText(payload.telefone),
  };
}

export function normalizeServicoPayload(payload: Record<string, unknown>) {
  return {
    nome: text(payload.nome),
    sku: nullableText(payload.sku),
    descricao: nullableText(payload.descricao),
    unidade: text(payload.unidade) || "UN",
    tipo: "SERVICO" as const,
    precoVenda: numberValue(payload.precoVenda),
    custoReferencia:
      payload.custoReferencia === null || payload.custoReferencia === undefined
        ? null
        : numberValue(payload.custoReferencia),
    ativo: payload.ativo !== false,
  };
}

export function normalizeVendaPayload(payload: Record<string, unknown>) {
  return {
    clienteId: nullableText(payload.clienteId),
    observacao: nullableText(payload.observacao),
  };
}

export function normalizeCompraPayload(payload: Record<string, unknown>) {
  return {
    fornecedorId: nullableText(payload.fornecedorId),
    observacao: nullableText(payload.observacao),
  };
}

export function normalizeOrdemServicoPayload(payload: Record<string, unknown>) {
  return {
    usuarioId: text(payload.usuarioId),
    clienteId: nullableText(payload.clienteId),
    servicoId: nullableText(payload.servicoId),
    titulo: text(payload.titulo),
    descricao: nullableText(payload.descricao),
  };
}

export function normalizeItemTransacaoPayload(payload: Record<string, unknown>) {
  return {
    transacaoId: text(payload.transacaoId),
    itemTransacaoId: nullableText(payload.itemTransacaoId),
    produtoId: text(payload.produtoId),
    quantidade: positiveNumber(payload.quantidade, 1),
    valorUnitario: numberValue(payload.valorUnitario),
    valorDesconto: numberValue(payload.valorDesconto),
    descricao: nullableText(payload.descricao),
  };
}
