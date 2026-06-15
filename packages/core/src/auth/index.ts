export type {
  Sessao,
  SessaoValidada,
  UsuarioAuth, 
  LocatarioAuth, 
  JwtPayloadAuth,
  EmitirSessaoPlataformaInput,
  EmitirSessaoPlataformaOutput,
  EmitirSessaoPlataformaResult,
  EmitirSessaoInput,
  EmitirSessaoOutput,
  EmitirSessaoResult,
  ValidarSessaoInput,
  ValidarSessaoOutput,
  ValidarSessaoResult,
  RotacionarRefreshInput,
  RotacionarRefreshOutput,
  RotacionarRefreshResult,
} from "./tipos.js";

export {
  credenciaisInvalidas,
  tokenInvalidoOuExpirado,
  usuarioNaoPodeAutenticar,
  locatarioNaoPodeAutenticar,
  authEntradaInvalida,
  sessaoInvalida,
} from "./erros.js";

export { validarEmailAuth, validarSenha, validarLocatarioIdAuth, validarTokenNaoVazio } from "./validadores.js";

export type { HashAuthPorta, JwtAuthPorta, TokensAuthPorta, RbacAuthPorta, EventosSegurancaPorta } from "./portasServico.js";

export type { LocatariosRepositorioAuth, UsuariosRepositorioAuth } from "./portasRepositorio.js";

export { createFnEmitirSessao } from "./usecases/emitirSessao.js";
export { createFnValidarSessao } from "./usecases/validarSessao.js";
export { createFnRotacionarRefresh } from "./usecases/rotacionarRefresh.js";
export { createFnResolverContextoAutorizado } from "./usecases/resolverContextoAutorizado.js";
export { createFnLogout } from "./usecases/logout.js";
export { createFnEmitirSessaoPlataforma } from "./usecases/emitirSessaoPlataforma.js";
export { createFnRotacionarRefreshPlataforma } from "./usecases/rotacionarRefreshPlataforma.js";
export { createFnLogoutPlataforma } from "./usecases/logoutPlataforma.js";
