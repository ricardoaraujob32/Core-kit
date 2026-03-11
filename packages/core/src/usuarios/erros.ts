import type { ErroApp } from "../erros";
import { wrapErr } from "../result";

export function emailInvalido(email: string) {
  return wrapErr<ErroApp>({
    codigo: "INVALIDO",
    mensagem: "Email inválido.",
    detalhes: { email },
  });
}

export function senhaHashInvalida() {
  return wrapErr<ErroApp>({
    codigo: "INVALIDO",
    mensagem: "Senha hash inválida.",
    detalhes: { campo: "senhaHash" },
  });
}

export function usuarioInvalido(detalhes?: Record<string, unknown>) {
  return wrapErr<ErroApp>({
    codigo: "INVALIDO",
    mensagem: "Dados do usuário inválidos.",
    detalhes,
  });
}

export function usuarioNaoEncontrado(usuarioId: string) {
  return wrapErr<ErroApp>({
    codigo: "NAO_ENCONTRADO",
    mensagem: "Usuário não encontrado.",
    detalhes: { usuarioId },
  });
}

export function emailJaEmUso(email: string) {
  return wrapErr<ErroApp>({
    codigo: "CONFLITO",
    mensagem: "Já existe usuário com este email no locatário.",
    detalhes: { email },
  });
}