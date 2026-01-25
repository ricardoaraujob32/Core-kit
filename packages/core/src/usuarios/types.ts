// packages/core/src/usuarios/types.ts

export type IdUsuario = string;

export type StatusUsuario = "ATIVO" | "INATIVO";

export type Usuario = {
  id: IdUsuario;
  nome: string;
  status: StatusUsuario;
};

export type NovoUsuario = {
  nome: string;
}