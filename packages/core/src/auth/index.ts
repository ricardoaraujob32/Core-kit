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

export { criarEmitirSessao } from "./usecases/emitirSessao";
export { criarValidarSessao } from "./usecases/validarSessao";
export { criarRotacionarRefresh } from "./usecases/rotacionarRefresh";
export { criarResolverContextoAutorizado } from "./usecases/resolverContextoAutorizado";