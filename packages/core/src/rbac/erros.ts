// packages/core/src/rbac/erros.ts

import { createErroApp } from "../ROPHelpers";
import { Permissao } from "./tipos";

export function permissaoInvalida(permissao: Permissao) {
  return createErroApp({
    codigo: "RBAC_PERMISSAO_INVALIDA",
    mensagem: "Permissão inválida.",
    detalhes: { permissao },
  });
}

export function naoAutenticado() {
  return createErroApp({
    codigo: "RBAC_NAO_AUTENTICADO",
    mensagem: "Usuário não autenticado.",
    detalhes: {},
  });
}

export function naoAutorizado(permissao: Permissao) {
  return createErroApp({
    codigo: "RBAC_NAO_AUTORIZADO",
    mensagem: "Usuário não possui a permissão necessária.",
    detalhes: { permissao },
  });
}