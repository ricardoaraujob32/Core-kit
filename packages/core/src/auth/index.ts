export type {
  Sessao,
  SessaoValidada,
  UsuarioAuth, 
  LocatarioAuth, 
  JwtPayloadAuth,
  EmitirSessaoInput,
  EmitirSessaoOutput,
  EmitirSessaoResult,
  ValidarSessaoInput,
  ValidarSessaoOutput,
  ValidarSessaoResult,
  RotacionarRefreshInput,
  RotacionarRefreshOutput,
  RotacionarRefreshResult,
  ResolverContextoAutorizadoInput,
  ResolverContextoAutorizadoOutput,
  ResolverContextoAutorizadoResult
} from "./tipos";

export {
  credenciaisInvalidas,
  tokenInvalidoOuExpirado,
  usuarioNaoPodeAutenticar,
  locatarioNaoPodeAutenticar,
  authEntradaInvalida,
  sessaoInvalida,
} from "./erros";

export { validarEmailAuth, validarSenha, validarLocatarioIdAuth, validarTokenNaoVazio } from "./validadores";

export type { HashAuthPorta, JwtAuthPorta, TokensAuthPorta, RbacAuthPorta, EventosSegurancaPorta } from "./portasServico";

export type { LocatariosRepositorioAuth, UsuariosRepositorioAuth } from "./portasRepositorio";

export { createFnEmitirSessao } from "./usecases/emitirSessao";
export { createFnValidarSessao } from "./usecases/validarSessao";
export { createFnRotacionarRefresh } from "./usecases/rotacionarRefresh";
export { createFnResolverContextoAutorizado } from "./usecases/resolverContextoAutorizado";