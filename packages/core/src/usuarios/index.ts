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
  InativarUsuarioInput,
  InativarUsuarioOutput,
  InativarUsuarioResult,
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
export { createFnInativarUsuario } from "./usecases/inativarUsuario";
export { createFnReativarUsuario } from "./usecases/reativarUsuario";