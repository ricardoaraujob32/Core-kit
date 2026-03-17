// packages/core/src/auth/erros.ts

import type { ErroApp } from "../kernel/erros";
import { wrapErr } from "../kernel/result";

export function credenciaisInvalidas() {
  return wrapErr<ErroApp>({
    codigo: "AUTH_CREDENCIAIS_INVALIDAS",
    mensagem: "Credenciais inválidas.",
    detalhes: {},
  });
}

export function tokenInvalidoOuExpirado() {
  return wrapErr<ErroApp>({
    codigo: "AUTH_TOKEN_INVALIDO_OU_EXPIRADO",
    mensagem: "Token inválido ou expirado.",
    detalhes: {},
  });
}

export function usuarioNaoPodeAutenticar(status: string) {
  return wrapErr<ErroApp>({
    codigo: "AUTH_USUARIO_NAO_PODE_AUTENTICAR",
    mensagem: "Usuário não pode autenticar.",
    detalhes: { status },
  });
}

export function locatarioNaoPodeAutenticar(status: string) {
  return wrapErr<ErroApp>({
    codigo: "AUTH_LOCATARIO_NAO_PODE_AUTENTICAR",
    mensagem: "Locatário não pode autenticar.",
    detalhes: { status },
  });
}

export function authEntradaInvalida(detalhes?: Record<string, unknown>) {
  return wrapErr<ErroApp>({
    codigo: "AUTH_ENTRADA_INVALIDA",
    mensagem: "Entrada inválida para autenticação.",
    detalhes,
  });
}

export function sessaoInvalida() {
  return wrapErr<ErroApp>({
    codigo: "AUTH_SESSAO_INVALIDA",
    mensagem: "Sessão inválida.",
    detalhes: {},
  });
}