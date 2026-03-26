// packages/core/src/usuarios/maquinaEstados.ts

import { transicionarEstado, type TabelaTransicoes } from "../kernel";
import { usuarioEncerrado, usuarioInativo, usuarioSuspenso } from "./erros";
import type { EventoUsuario, StatusUsuario, UsuarioId } from "./tipos";

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
      if (estadoAtual === "INATIVO") {
        return usuarioInativo(contexto?.usuarioId ?? params.usuarioId);
      }

      if (estadoAtual === "SUSPENSO") {
        return usuarioSuspenso(contexto?.usuarioId ?? params.usuarioId);
      }

      return usuarioEncerrado(contexto?.usuarioId ?? params.usuarioId);
    },
  });
}
