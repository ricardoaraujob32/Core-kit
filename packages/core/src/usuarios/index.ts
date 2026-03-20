// packages/core/src/usuarios/index.ts

export type {
  UsuarioId,
  StatusUsuario,
  Usuario,
  CriarUsuarioInput,
  CriarUsuarioOutput,
  ObterUsuarioInput,
  AtualizarUsuarioInput,
  InativarUsuarioInput,
  ReativarUsuarioInput,
  ListarUsuariosPorLocatarioInput,
  ListarUsuariosPorLocatarioOutput,
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

export {
  criarUsuariosRepositorioMemoria,
  criarUsuarioSeed,
} from "./repositorioMemoria";

export { createFnCriarUsuario as createCriarUsuario } from "./usecases/criarUsuario";
export { createFnObterUsuario as createObterUsuario } from "./usecases/obterUsuario";
export { createFnListarUsuariosPorLocatario as createListarUsuariosPorLocatario } from "./usecases/listarUsuariosPorLocatario";
export { createFnAtualizarUsuario as createAtualizarUsuario } from "./usecases/atualizarUsuario";
export { createFnInativarUsuario as createInativarUsuario } from "./usecases/inativarUsuario";
export { createFnReativarUsuario as createReativarUsuario } from "./usecases/reativarUsuario";