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
  EventosSegurancaPorta,
} from "./portasServico";

export { createFnEmitirSessao as criarEmitirSessao } from "./usecases/emitirSessao";
export { createFnValidarSessao as criarValidarSessao } from "./usecases/validarSessao";
export { createFnRotacionarRefresh as criarRotacionarRefresh } from "./usecases/rotacionarRefresh";
export { createFnResolverContextoAutorizado as criarResolverContextoAutorizado } from "./usecases/resolverContextoAutorizado";