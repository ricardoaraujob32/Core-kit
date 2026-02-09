// packages/core/src/usuarios/portasRepositorio.ts
import type { IdUsuario, IdLocatario } from "../contextoExecucao";
import type { Usuario, NovoUsuario } from "./tipos";

export type RepositorioUsuarios = {
  obterPorId(locatarioId: IdLocatario, id: IdUsuario): Promise<Usuario | null>;
  obterPorNome(locatarioId: IdLocatario, nome: string): Promise<Usuario | null>;
  listar(locatarioId: IdLocatario): Promise<Usuario[]>;
  criar(dados: NovoUsuario): Promise<Usuario>;
};
