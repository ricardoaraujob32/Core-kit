import { Permissao } from "../permissoes";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";
import { Result } from "../result";
import { ErroApp } from "../erros";

export interface RbacRepositorio {
  listarPermissoesDoUsuario(params: {
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
  }): Promise<Result<Permissao[], ErroApp>>;
}