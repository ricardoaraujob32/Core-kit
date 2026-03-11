// packages/core/src/usuarios/index.ts

// Tipos
export type {
  UsuarioId,
  UsuarioStatus,
  Usuario,
  CriarUsuarioInput,
  CriarUsuarioOutput,
  ObterUsuarioInput,
  ListarUsuariosInput,
  ListarUsuariosOutput,
  ResultadoCriarUsuario,
  ResultadoObterUsuario,
  ResultadoListarUsuarios,
} from "./tipos";

// Erros
export {
  emailInvalido,
  senhaHashInvalida,
  usuarioInvalido,
  usuarioNaoEncontrado,
  emailJaEmUso,
} from "./erros";

// Validadores
export {
  validarLocatarioId,
  validarUsuarioId,
  validarEmail,
  validarSenhaHash,
  validarLimite,
} from "./validadores";

// Repositório
export type { UsuariosRepositorio } from "./portasRepositorio";
export {
  criarUsuariosRepositorioMemoria,
  criarUsuarioSeed,
} from "./repositorioMemoria";

// Casos de uso
export { criarCriarUsuario } from "./usecases/criarUsuario";
export { criarObterUsuario } from "./usecases/obterUsuario";
export { criarListarUsuarios } from "./usecases/listarUsuarios";