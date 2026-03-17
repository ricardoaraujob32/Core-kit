import { ErroApp } from "../erros";
import { LocatarioId } from "../locatarios";
import { Result } from "../result";
import { Usuario, UsuarioId } from "./tipos";

export interface UsuariosRepositorio {
  criar(params: {
    usuarioId: UsuarioId;
    locatarioId: LocatarioId;
    email: string;
    nome: string;
    senhaHash: string;
    status: "ATIVO";
    ultimoLoginEm: Date | null;
    criadoEm: Date;
    atualizadoEm: Date;
    excluidoEm: Date | null;
  }): Promise<Result<{ usuarioId: UsuarioId }, ErroApp>>;

  buscarPorId(params: {
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
  }): Promise<Result<Usuario | null, ErroApp>>;

  buscarPorEmailNoLocatario(params: {
    locatarioId: LocatarioId | null;
    emailNormalizado: string;
  }): Promise<Result<Usuario | null, ErroApp>>;


   listarPorLocatario(params: {
    locatarioId: LocatarioId;
    limite: number;
    cursor?: string;
  }): Promise<Result<Usuario[], ErroApp>>;

  atualizar(usuario: Usuario): Promise<Result<Usuario, ErroApp>>;

  atualizarUltimoLogin(params: {
    locatarioId: string;
    usuarioId: string;
    quando: Date;
  }): Promise<Result<void, ErroApp>>;
}




  


  

  