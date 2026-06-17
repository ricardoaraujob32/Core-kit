// packages/core/src/financeiro/validadores.ts

import { wrapOk, type ErroApp, type Result } from "../kernel/index.js";
import type { LocatarioId } from "../locatarios/index.js";
import type { FiltroStatusContaFinanceira, ListarContasFinanceirasInput, ObterResumoFinanceiroInput } from "./tipos.js";
import { erroFinanceiroInvalido } from "./erros.js";

function validarTextoObrigatorio(value: unknown, campo: string): Result<string, ErroApp> {
  if (typeof value !== "string" || !value.trim()) {
    return erroFinanceiroInvalido({ campo, motivo: "obrigatorio" });
  }

  return wrapOk(value.trim());
}

function validarDataOpcional(value: unknown, campo: string): Result<Date | null, ErroApp> {
  if (value === undefined || value === null) return wrapOk(null);
  if (value instanceof Date && !Number.isNaN(value.getTime())) return wrapOk(value);

  return erroFinanceiroInvalido({ campo, motivo: "data_invalida" });
}

function validarLimite(value: unknown): Result<number | undefined, ErroApp> {
  if (value === undefined || value === null) return wrapOk(undefined);

  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 100) {
    return erroFinanceiroInvalido({ campo: "limite", motivo: "deve_ser_inteiro_entre_1_e_100" });
  }

  return wrapOk(value);
}

function validarStatus(value: unknown): Result<FiltroStatusContaFinanceira | undefined, ErroApp> {
  if (value === undefined || value === null || value === "") return wrapOk(undefined);
  if (value === "ABERTO" || value === "LIQUIDADO" || value === "TODOS") return wrapOk(value);

  return erroFinanceiroInvalido({ campo: "status", motivo: "status_invalido" });
}

export function validarObterResumoFinanceiroInput(input: ObterResumoFinanceiroInput): Result<ObterResumoFinanceiroInput, ErroApp> {
  const locatarioId = validarTextoObrigatorio(input.locatarioId, "locatarioId");
  if (!locatarioId.ok) return locatarioId;

  const hoje = validarDataOpcional(input.hoje, "hoje");
  if (!hoje.ok) return hoje;

  const inicio = validarDataOpcional(input.periodo?.inicio, "periodo.inicio");
  if (!inicio.ok) return inicio;

  const fim = validarDataOpcional(input.periodo?.fim, "periodo.fim");
  if (!fim.ok) return fim;

  return wrapOk({
    ...input,
    locatarioId: locatarioId.value as LocatarioId,
    hoje: hoje.value ?? undefined,
    periodo: {
      inicio: inicio.value,
      fim: fim.value,
    },
  });
}

export function validarListarContasFinanceirasInput(input: ListarContasFinanceirasInput): Result<ListarContasFinanceirasInput, ErroApp> {
  const locatarioId = validarTextoObrigatorio(input.locatarioId, "locatarioId");
  if (!locatarioId.ok) return locatarioId;

  const status = validarStatus(input.status);
  if (!status.ok) return status;

  const dataInicial = validarDataOpcional(input.dataInicial, "dataInicial");
  if (!dataInicial.ok) return dataInicial;

  const dataFinal = validarDataOpcional(input.dataFinal, "dataFinal");
  if (!dataFinal.ok) return dataFinal;

  const limite = validarLimite(input.limite);
  if (!limite.ok) return limite;

  return wrapOk({
    ...input,
    locatarioId: locatarioId.value as LocatarioId,
    status: status.value,
    dataInicial: dataInicial.value,
    dataFinal: dataFinal.value,
    limite: limite.value,
  });
}
