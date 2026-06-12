// packages/core/src/usuarios/maquinaEstados.ts

import { createErroApp, ErroApp, Result, transicionarEstado, wrapOk, type TabelaTransicoes } from "../kernel/index.js";
import { usuarioEncerrado, usuarioInativo, usuarioSuspenso } from "./erros.js";
import type { EventoUsuario, StatusUsuario, Usuario, UsuarioId } from "./tipos.js";

/**
 * 
 */
const TRANSICOES_USUARIO: TabelaTransicoes<StatusUsuario, EventoUsuario> = {
  ATIVO: {
    OPERAR: "ATIVO",
    INATIVAR: "INATIVO",
    SUSPENDER: "SUSPENSO",
    ENCERRAR: "ENCERRADO",
  },
  INATIVO: {
    REATIVAR: "ATIVO",
    ENCERRAR: "ENCERRADO",
  },
  SUSPENSO: {
    REATIVAR: "ATIVO",
    ENCERRAR: "ENCERRADO",
  },
  ENCERRADO: {},
};

/**
 * 
 * @param params 
 * @returns 
 */
export function transicionarEstadoUsuario(params: {
  usuarioId: UsuarioId;
  statusAtual: StatusUsuario;
  evento: EventoUsuario;
}) {
  return transicionarEstado({
    tabela: TRANSICOES_USUARIO,
    estadoAtual: params.statusAtual,
    evento: params.evento,
    contexto: { usuarioId: params.usuarioId },
    onTransicaoInvalida: ({ estadoAtual, contexto }) => {
      if (params.statusAtual === "INATIVO" && params.evento === "OPERAR") {
        return usuarioInativo(params.usuarioId);
      }

      if (params.statusAtual === "SUSPENSO" && params.evento === "OPERAR") {
        return usuarioSuspenso(params.usuarioId);
      }

      if (params.statusAtual === "ENCERRADO") {
        return usuarioEncerrado(params.usuarioId);
      }

      return transicaoStatusUsuarioInvalida(params);
    },
  });
}

/**
 * 
 * @param usuario 
 * @returns 
 */
export function exigirEstadoOperacionalUsuario(usuario: Usuario): Result<Usuario, ErroApp> {
  const transicao = transicionarEstadoUsuario({
    usuarioId: usuario.usuarioId,
    statusAtual: usuario.status,
    evento: "OPERAR",
  });

  if (!transicao.ok) return transicao;

  return wrapOk(usuario);
}

/**
 * 
 * @param params 
 * @returns 
 */
export function transicaoStatusUsuarioInvalida(params: {
  usuarioId: UsuarioId;
  statusAtual: StatusUsuario;
  evento: EventoUsuario;
}) {
  return createErroApp({
    codigo: "USUARIO_INVALIDO",
    mensagem: "Transição de status do usuário inválida.",
    detalhes: params,
  });
}
