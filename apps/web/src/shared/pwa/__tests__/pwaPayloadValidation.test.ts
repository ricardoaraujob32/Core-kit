// apps/web/src/shared/pwa/__tests__/pwaPayloadValidation.test.ts

import { describe, expect, it } from "vitest";
import {
  PwaPayloadValidationError,
  validateAndNormalizePwaPayload,
} from "../pwaPayloadValidation";
import type { PwaQueueItem } from "../pwaSyncTypes";

function item(type: string, payload: unknown): PwaQueueItem {
  return {
    id: "1",
    type,
    payload,
    localId: "local",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    lastError: null,
    lastErrorKind: null,
    lastErrorDetails: null,
  };
}

describe("pwaPayloadValidation", () => {
  it("normaliza cliente", () => {
    const result = validateAndNormalizePwaPayload(
      item("clientes.criar", { nome: "  Ana  ", email: "" }),
    );

    expect(result).toEqual({
      nome: "Ana",
      documento: null,
      email: null,
      telefone: null,
    });
  });

  it("bloqueia cliente sem nome", () => {
    expect(() =>
      validateAndNormalizePwaPayload(item("clientes.criar", { nome: "" })),
    ).toThrow(PwaPayloadValidationError);
  });

  it("bloqueia serviço com preço negativo", () => {
    expect(() =>
      validateAndNormalizePwaPayload(
        item("servicos.criar", { nome: "Serviço", precoVenda: -1 }),
      ),
    ).toThrow(PwaPayloadValidationError);
  });

  it("normaliza item de transação", () => {
    const result = validateAndNormalizePwaPayload(
      item("transacoes.itens.adicionar", {
        transacaoId: "t1",
        produtoId: "p1",
        quantidade: "2",
        valorUnitario: "10",
        valorDesconto: "",
      }),
    );

    expect(result).toMatchObject({
      transacaoId: "t1",
      produtoId: "p1",
      quantidade: 2,
      valorUnitario: 10,
      valorDesconto: 0,
    });
  });
});
