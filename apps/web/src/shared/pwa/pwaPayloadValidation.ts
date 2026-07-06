// apps/web/src/shared/pwa/pwaPayloadValidation.ts

import {
  normalizeClientePayload,
  normalizeCompraPayload,
  normalizeFornecedorPayload,
  normalizeItemTransacaoPayload,
  normalizeOrdemServicoPayload,
  normalizeServicoPayload,
  normalizeVendaPayload,
} from "./pwaPayloadNormalizers";
import type { PwaQueueItem } from "./pwaSyncTypes";

export class PwaPayloadValidationError extends Error {
  code = "PWA_PAYLOAD_INVALIDO";

  constructor(
    message: string,
    public readonly details: Record<string, unknown>,
  ) {
    super(message);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function required(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new PwaPayloadValidationError(`Campo obrigatório ausente: ${field}`, {
      field,
    });
  }
}

function nonNegative(value: unknown, field: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new PwaPayloadValidationError(`Campo numérico inválido: ${field}`, {
      field,
      value,
    });
  }
}

function positive(value: unknown, field: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new PwaPayloadValidationError(
      `Campo deve ser maior que zero: ${field}`,
      {
        field,
        value,
      },
    );
  }
}

export function validateAndNormalizePwaPayload(item: PwaQueueItem): unknown {
  const payload = asRecord(item.payload);

  switch (item.type) {
    case "clientes.criar": {
      const normalized = normalizeClientePayload(payload);
      required(normalized.nome, "nome");
      return normalized;
    }

    case "fornecedores.criar": {
      const normalized = normalizeFornecedorPayload(payload);
      required(normalized.nome, "nome");
      return normalized;
    }

    case "servicos.criar": {
      const normalized = normalizeServicoPayload(payload);
      required(normalized.nome, "nome");
      required(normalized.unidade, "unidade");
      nonNegative(normalized.precoVenda, "precoVenda");
      return normalized;
    }

    case "vendas.criar":
      return normalizeVendaPayload(payload);

    case "compras.criar":
      return normalizeCompraPayload(payload);

    case "ordensServico.criar": {
      const normalized = normalizeOrdemServicoPayload(payload);
      required(normalized.titulo, "titulo");
      return normalized;
    }

    case "transacoes.itens.adicionar": {
      const normalized = normalizeItemTransacaoPayload(payload);
      required(normalized.transacaoId, "transacaoId");
      required(normalized.produtoId, "produtoId");
      positive(normalized.quantidade, "quantidade");
      nonNegative(normalized.valorUnitario, "valorUnitario");
      nonNegative(normalized.valorDesconto, "valorDesconto");
      return normalized;
    }

    case "transacoes.itens.atualizar": {
      const normalized = normalizeItemTransacaoPayload(payload);
      required(normalized.transacaoId, "transacaoId");
      required(normalized.itemTransacaoId, "itemTransacaoId");
      positive(normalized.quantidade, "quantidade");
      nonNegative(normalized.valorUnitario, "valorUnitario");
      nonNegative(normalized.valorDesconto, "valorDesconto");
      return normalized;
    }

    case "transacoes.itens.remover": {
      const normalized = normalizeItemTransacaoPayload(payload);
      required(normalized.transacaoId, "transacaoId");
      required(normalized.itemTransacaoId, "itemTransacaoId");
      return normalized;
    }

    default:
      return item.payload;
  }
}
