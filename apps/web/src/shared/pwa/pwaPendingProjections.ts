// apps/web/src/shared/pwa/pwaPendingProjections.ts

import { isOfflineEntityId } from "./createOfflineEntity";
import type { PwaQueueItem } from "./pwaSyncTypes";

export type PendingProjectionKind =
  | "cliente"
  | "fornecedor"
  | "produto"
  | "servico"
  | "transacao"
  | "ordemServico";

function nowIso(): string {
  return new Date().toISOString();
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function texto(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numero(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isQueueItemVisibleAsPending(item: PwaQueueItem): boolean {
  return item.status === "pending" || item.status === "failed" || item.status === "blocked";
}

export function projectClienteFromQueue(item: PwaQueueItem) {
  if (item.type !== "clientes.criar" || !item.localId) return null;

  const payload = asRecord(item.payload);

  return {
    clienteId: item.localId,
    nome: texto(payload.nome) ?? "Cliente pendente",
    documento: texto(payload.documento),
    email: texto(payload.email),
    telefone: texto(payload.telefone),
    criadoEm: item.createdAt,
    atualizadoEm: item.updatedAt,
    __pwaPending: true,
    __pwaQueueStatus: item.status,
  };
}

export function projectFornecedorFromQueue(item: PwaQueueItem) {
  if (item.type !== "fornecedores.criar" || !item.localId) return null;

  const payload = asRecord(item.payload);

  return {
    fornecedorId: item.localId,
    nome: texto(payload.nome) ?? "Fornecedor pendente",
    documento: texto(payload.documento),
    email: texto(payload.email),
    telefone: texto(payload.telefone),
    criadoEm: item.createdAt,
    atualizadoEm: item.updatedAt,
    __pwaPending: true,
    __pwaQueueStatus: item.status,
  };
}

export function projectProdutoServicoFromQueue(item: PwaQueueItem) {
  if (item.type !== "servicos.criar" || !item.localId) return null;

  const payload = asRecord(item.payload);

  return {
    produtoId: item.localId,
    nome: texto(payload.nome) ?? "Serviço pendente",
    sku: texto(payload.sku),
    descricao: texto(payload.descricao),
    unidade: texto(payload.unidade) ?? "UN",
    tipo: "SERVICO",
    precoVenda: numero(payload.precoVenda),
    custoReferencia:
      payload.custoReferencia === null || payload.custoReferencia === undefined
        ? null
        : numero(payload.custoReferencia),
    ativo: true,
    criadoEm: item.createdAt,
    atualizadoEm: item.updatedAt,
    __pwaPending: true,
    __pwaQueueStatus: item.status,
  };
}

export function projectTransacaoFromQueue(item: PwaQueueItem) {
  if (!item.localId) return null;

  const payload = asRecord(item.payload);
  const createdAt = item.createdAt || nowIso();

  if (item.type === "vendas.criar") {
    return {
      transacaoId: item.localId,
      tipo: "VENDA",
      clienteId: texto(payload.clienteId),
      fornecedorId: null,
      status: "RASCUNHO",
      valorSubtotal: 0,
      valorDesconto: 0,
      valorAcrescimo: 0,
      valorTotal: 0,
      observacao: texto(payload.observacao),
      criadoEm: createdAt,
      atualizadoEm: item.updatedAt,
      itens: [],
      __pwaPending: true,
      __pwaQueueStatus: item.status,
    };
  }

  if (item.type === "compras.criar") {
    return {
      transacaoId: item.localId,
      tipo: "COMPRA",
      clienteId: null,
      fornecedorId: texto(payload.fornecedorId),
      status: "RASCUNHO",
      valorSubtotal: 0,
      valorDesconto: 0,
      valorAcrescimo: 0,
      valorTotal: 0,
      observacao: texto(payload.observacao),
      criadoEm: createdAt,
      atualizadoEm: item.updatedAt,
      itens: [],
      __pwaPending: true,
      __pwaQueueStatus: item.status,
    };
  }

  return null;
}

export function projectOrdemServicoFromQueue(item: PwaQueueItem) {
  if (item.type !== "ordensServico.criar" || !item.localId) return null;

  const payload = asRecord(item.payload);
  const createdAt = item.createdAt || nowIso();

  return {
    ordemServicoId: item.localId,
    locatarioId: "offline",
    clienteId: texto(payload.clienteId),
    servicoId: texto(payload.servicoId),
    transacaoId: null,
    status: "ABERTA",
    titulo: texto(payload.titulo) ?? "OS pendente",
    descricao: texto(payload.descricao),
    abertaEm: createdAt,
    fechadaEm: null,
    criadoEm: createdAt,
    atualizadoEm: item.updatedAt,
    __pwaPending: true,
    __pwaQueueStatus: item.status,
  };
}

export function getPendingProjectionId(item: unknown): string | null {
  const record = asRecord(item);

  return (
    texto(record.clienteId) ??
    texto(record.fornecedorId) ??
    texto(record.produtoId) ??
    texto(record.transacaoId) ??
    texto(record.ordemServicoId) ??
    null
  );
}

export function isPendingProjection(item: unknown): boolean {
  const id = getPendingProjectionId(item);
  return Boolean(id && isOfflineEntityId(id));
}
