// packages/core/src/locatarios/erros.ts

import { createErroApp } from "../kernel";
import { LocatarioId } from "./tipos";

export function locatarioInvalido(detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "LOCATARIO_INVALIDO",
    mensagem: "Dados do locatário inválidos.",
    detalhes,
  });
}

export function locatarioNaoEncontrado(locatarioId: LocatarioId) {
  return createErroApp({
    codigo: "LOCATARIO_NAO_ENCONTRADO",
    mensagem: "Locatário não encontrado.",
    detalhes: { locatarioId },
  });
}

export function locatarioSuspenso(locatarioId: LocatarioId) {
  return createErroApp({
    codigo: "LOCATARIO_SUSPENSO",
    mensagem: "Locatário suspenso.",
    detalhes: { locatarioId, status: "SUSPENSO" },
  });
}

export function locatarioEncerrado(locatarioId: LocatarioId) {
  return createErroApp({
    codigo: "LOCATARIO_ENCERRADO",
    mensagem: "Locatário encerrado.",
    detalhes: { locatarioId, status: "ENCERRADO" },
  });
}