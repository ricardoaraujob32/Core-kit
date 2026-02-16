// packages/core/src/usuarios/portasRepositorio.ts
import { LocatarioId } from "../locatario";
import type { Usuario, NovoUsuario, UsuarioId } from "./tipos";

export type RepositorioUsuarios = {
  obterPorId(locatarioId: LocatarioId, id: UsuarioId): Promise<Usuario | null>;
  obterPorNome(locatarioId: LocatarioId, nome: string): Promise<Usuario | null>;
  listar(locatarioId: LocatarioId): Promise<Usuario[]>;
  criar(dados: NovoUsuario): Promise<Usuario>;
};
