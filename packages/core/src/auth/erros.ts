// packages/core/src/auth/erros.ts

import { ErroApp } from "../erros";
import { Result, wrapErr } from "../result";
import { createErroApp } from "../ROPHelpers";


export function credenciaisInvalidas(): Result<never, ErroApp> {
  return createErroApp({ codigo: "NAO_AUTENTICADO" });
}

export function tokenInvalidoOuExpirado(): Result<never, ErroApp> {
  return createErroApp({ codigo: "NAO_AUTENTICADO" });
}

export function usuarioInativoOuBloqueado(): Result<never, ErroApp> {
  return createErroApp({ codigo: "NAO_AUTENTICADO" });
}

export function locatarioInvalidoOuInativo(): Result<never, ErroApp> {
  return createErroApp({ codigo: "CONFLITO" });
}

export function entradaInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp({ codigo: "INVALIDO", detalhes });
}

export function erroNaoAutenticado(): ErroApp {
  return {
    codigo: "NAO_AUTENTICADO",
    mensagem: "Usuário não autenticado"
  }
}

export function erroSessaoInvalida(): ErroApp {
  return {
    codigo: "SESSAO_INVALIDA",
    mensagem: "Sessão inválida"
  }
}

export function sessaoInvalida() {
  return wrapErr<ErroApp>({
    codigo: "NAO_AUTENTICADO",
    mensagem: "Sessão inválida.",
  });
}

export function usuarioNaoPodeAutenticar(status: string) {
  return wrapErr<ErroApp>({
    codigo: "NAO_AUTENTICADO",
    mensagem: "Usuário não pode autenticar.",
    detalhes: { status },
  });
}