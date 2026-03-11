// import type { ErroApp } from "../erros";
import { ErroApp } from "../erros";
import { wrapErr } from "../result";

export function entradaInvalida(detalhes?: Record<string, unknown>) {
  return wrapErr<ErroApp>({
    codigo: "INVALIDO",
    mensagem: "Entrada inválida.",
    detalhes,
  });
}

export function tokenNaoAutenticado() {
  return wrapErr<ErroApp>({
    codigo: "NAO_AUTENTICADO",
    mensagem: "Token inválido, expirado ou revogado.",
  });
}

export function conflitoRotacao(detalhes?: Record<string, unknown>) {
  return wrapErr<ErroApp>({
    codigo: "CONFLITO",
    mensagem: "Conflito na rotação do token.",
    detalhes,
  });
}