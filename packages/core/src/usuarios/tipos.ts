// packages/core/src/usuarios/types.ts

import type { IdUsuario, IdLocatario } from "../contextoExecucao";

export type StatusUsuario = "ATIVO" | "INATIVO" | "BLOQUEADO";

export type Usuario = {
  id: IdUsuario;
  locatarioId: IdLocatario;
  nome: string;
  status: StatusUsuario;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type NovoUsuario = {
  locatarioId: IdLocatario;
  nome: string;
}