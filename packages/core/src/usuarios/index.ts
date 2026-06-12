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
} from "./tipos.js";

export {
  usuarioInvalido,
  usuarioNaoEncontrado,
  usuarioInativo,
  usuarioSuspenso,
  usuarioEncerrado,
  emailUsuarioJaExiste,
} from "./erros.js";

export {
  validarUsuarioId,
  validarNomeUsuario,
  validarEmailUsuario,
  validarSenhaHash,
} from "./validadores.js";

export type { UsuariosRepositorio } from "./portasRepositorio.js";



export { createFnCriarUsuario } from "./usecases/criarUsuario.js";
export { createFnObterUsuario } from "./usecases/obterUsuario.js";
export { createFnListarUsuariosPorLocatario } from "./usecases/listarUsuariosPorLocatario.js";
export { createFnAtualizarUsuario } from "./usecases/atualizarUsuario.js";
export { createFnDesativarUsuario } from "./usecases/desativarUsuario.js";
export { createFnReativarUsuario } from "./usecases/reativarUsuario.js";
export { createFnAlterarSenhaUsuario } from "./usecases/alterarSenhaUsuario.js";
export { createFnRedefinirSenhaUsuario } from "./usecases/redefinirSenhaUsuario.js";