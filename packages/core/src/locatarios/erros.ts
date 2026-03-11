import type { ErroApp } from "../erros";
import { wrapErr } from "../result";

export function locatarioInvalido(detalhes?: Record<string, unknown>) {
  return wrapErr<ErroApp>({
    codigo: "INVALIDO",
    mensagem: "Dados do locatário inválidos.",
    detalhes,
  });
}

export function locatarioNaoEncontrado(locatarioId: string) {
  return wrapErr<ErroApp>({
    codigo: "NAO_ENCONTRADO",
    mensagem: "Locatário não encontrado.",
    detalhes: { locatarioId },
  });
}

export function locatarioSuspenso(locatarioId: string) {
  return wrapErr<ErroApp>({
    codigo: "CONFLITO",
    mensagem: "Locatário suspenso.",
    detalhes: { locatarioId, status: "SUSPENSO" },
  });
}

export function locatarioEncerrado(locatarioId: string) {
  return wrapErr<ErroApp>({
    codigo: "CONFLITO",
    mensagem: "Locatário encerrado.",
    detalhes: { locatarioId, status: "ENCERRADO" },
  });
}