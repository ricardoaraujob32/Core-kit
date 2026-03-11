// packages/core/src/auth/validadores.ts

import { Result } from "../result";
import { ErroApp } from "../erros";
import { entradaInvalida } from "./erros";

export function validarEmail(email: string): Result<void, ErroApp> {
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return entradaInvalida({ campo: "email", motivo: "Email é obrigatório." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return entradaInvalida({ campo: "email", motivo: "Formato de email inválido." });
  }
  return { ok: true, value: undefined };
}

export function validarSenha(senha: string): Result<void, ErroApp> {
  if (!senha || typeof senha !== "string" || senha.trim().length === 0) {
    return entradaInvalida({ campo: "senha", motivo: "Senha é obrigatória." });
  }
  // Regras fortes podem ser adicionadas depois (RNF-03)
  return { ok: true, value: undefined };
}

export function validarLocatarioId(locatarioId: string): Result<void, ErroApp> {
  if (!locatarioId || typeof locatarioId !== "string" || locatarioId.trim().length === 0) {
    return entradaInvalida({ campo: "locatarioId", motivo: "Locatário ID é obrigatório." });
  }
  return { ok: true, value: undefined };
}

export function validarTokenNaoVazio(token: string): Result<void, ErroApp> {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return entradaInvalida({ campo: "token", motivo: "Token é obrigatório." });
  }
  return { ok: true, value: undefined };
}

function invalido(campo: string, valor?: unknown) {
  return {
    ok: false as const,
    error: {
      codigo: "INVALIDO" as const,
      mensagem: "Entrada inválida.",
      detalhes: { campo, valor },
    } satisfies ErroApp,
  };
}