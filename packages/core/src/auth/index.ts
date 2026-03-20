export type {
  EmitirSessaoInput,
  Sessao,
  JwtPayloadAuth,
  ValidarSessaoInput,
  SessaoValidada,
  RotacionarRefreshInput,
  ResolverContextoAutorizadoInput,
  ContextoAutorizado,
} from "./tipos";

export {
  credenciaisInvalidas,
  tokenInvalidoOuExpirado,
  usuarioNaoPodeAutenticar,
  locatarioNaoPodeAutenticar,
  authEntradaInvalida,
  sessaoInvalida,
} from "./erros";

export {
  validarEmailAuth,
  validarSenha,
  validarLocatarioIdAuth,
  validarTokenNaoVazio,
} from "./validadores";

export type {
  UsuarioAuth,
  UsuariosAuthPorta,
  LocatariosAuthPorta,
  HashAuthPorta,
  JwtAuthPorta,
  TokensAuthPorta,
  RbacAuthPorta,
} from "./portasServico";

export { createFnEmitirSessao } from "./usecases/emitirSessao";
export { createFnValidarSessao } from "./usecases/validarSessao";
export { createFnRotacionarRefresh } from "./usecases/rotacionarRefresh";
export { createFnResolverContextoAutorizado } from "./usecases/resolverContextoAutorizado";