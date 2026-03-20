// packages/core/src/usuarios/erros.ts

import { LocatarioId } from "../locatarios";
import { createErroApp } from "../kernel";
import { UsuarioId } from "./tipos";

export function usuarioInvalido(detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "USUARIO_INVALIDO",
    mensagem: "Dados do usuário inválidos.",
    detalhes,
  });
}

export function usuarioNaoEncontrado(usuarioId: UsuarioId) {
  return createErroApp({
    codigo: "USUARIO_NAO_ENCONTRADO",
    mensagem: "Usuário não encontrado.",
    detalhes: { usuarioId },
  });
}

export function usuarioInativo(usuarioId: UsuarioId) {
  return createErroApp({
    codigo: "USUARIO_INATIVO",
    mensagem: "Usuário inativo.",
    detalhes: { usuarioId },
  });
}

export function usuarioSuspenso(usuarioId: UsuarioId) {
  return createErroApp({
    codigo: "USUARIO_SUSPENSO",
    mensagem: "Usuário suspenso.",
    detalhes: { usuarioId },
  });
}

export function usuarioEncerrado(usuarioId: UsuarioId) {
  return createErroApp({
    codigo: "USUARIO_ENCERRADO",
    mensagem: "Usuário encerrado.",
    detalhes: { usuarioId },
  });
}

export function emailUsuarioJaExiste(email: string, locatarioId: LocatarioId | null,
) {
  return createErroApp({
    codigo: "USUARIO_EMAIL_JA_EXISTE",
    mensagem: "Já existe usuário com este e-mail no escopo informado.",
    detalhes: { email, locatarioId },
  });
}