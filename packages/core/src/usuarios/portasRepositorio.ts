import { ErroApp } from "../erros";
import { Result } from "../result";
import { Usuario, UsuarioStatus } from "./tipos";

export interface UsuariosRepositorio {
  criar(params: {
    locatarioId: string;
    email: string;
    senhaHash: string;
    status: UsuarioStatus;
  }): Promise<Result<{ usuarioId: string }, ErroApp>>;

  buscarPorId(params: {
    locatarioId: string;
    usuarioId: string;
  }): Promise<Result<Usuario | null, ErroApp>>;

  buscarPorEmail(params: {
    locatarioId: string;
    email: string;
  }): Promise<Result<Usuario | null, ErroApp>>;

  listar(params: {
    locatarioId: string;
    limite: number;
    cursor?: string;
  }): Promise<Result<Usuario[], ErroApp>>;

  atualizarUltimoLogin(params: {
    locatarioId: string;
    usuarioId: string;
    quando: Date;
  }): Promise<Result<void, ErroApp>>;
}