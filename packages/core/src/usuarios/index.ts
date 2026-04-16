// packages/core/src/usuarios/index.ts

export type {
  UsuarioId,
  StatusUsuario,
  Usuario,
  CriarUsuarioInput,
  CriarUsuarioOutput,
  CriarUsuarioResult,
  ObterUsuarioInput,
  ObterUsuarioOutput,
  ObterUsuarioResult,
  AtualizarUsuarioInput,
  AtualizarUsuarioOutput,
  AtualizarUsuarioResult,
  DesativarUsuarioInput,
  DesativarUsuarioOutput,
  DesativarUsuarioResult,
  ReativarUsuarioInput,
  ReativarUsuarioOutput,
  ReativarUsuarioResult,
  ListarUsuariosPorLocatarioInput,
  ListarUsuariosPorLocatarioOutput,
  ListarUsuariosPorLocatarioResult
} from "./tipos";

export {
  usuarioInvalido,
  usuarioNaoEncontrado,
  usuarioInativo,
  usuarioSuspenso,
  usuarioEncerrado,
  emailUsuarioJaExiste,
} from "./erros";

export {
  validarUsuarioId,
  validarNomeUsuario,
  validarEmailUsuario,
  validarSenhaHash,
} from "./validadores";

export type { UsuariosRepositorio } from "./portasRepositorio";



export { createFnCriarUsuario } from "./usecases/criarUsuario";
export { createFnObterUsuario } from "./usecases/obterUsuario";
export { createFnListarUsuariosPorLocatario } from "./usecases/listarUsuariosPorLocatario";
export { createFnAtualizarUsuario } from "./usecases/atualizarUsuario";
export { createFnDesativarUsuario } from "./usecases/desativarUsuario";
export { createFnReativarUsuario } from "./usecases/reativarUsuario";
export { createFnAlterarSenhaUsuario } from "./usecases/alterarSenhaUsuario";
export { createFnRedefinirSenhaUsuario } from "./usecases/redefinirSenhaUsuario";