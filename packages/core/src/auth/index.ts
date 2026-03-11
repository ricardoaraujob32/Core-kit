// packages/core/src/auth/index.ts

// Tipos
export type {
  EmitirSessaoInput,
  Sessao,
  JwtPayload,
  SessaoEmitida,
  ValidarSessaoInput,
  SessaoValidada,
  ResolverPermissoesInput,
  ContextoAutorizado,
  RotacionarRefreshInput,
  SessaoRotacionada,
  ResolverContextoAutorizadoInput,
  ResultadoSessao,
  ResultadoValidarSessao,
  ResultadoContextoAutorizado,
} from "./tipos";

// Erros
export {
  credenciaisInvalidas,
  tokenInvalidoOuExpirado,
  usuarioInativoOuBloqueado,
  locatarioInvalidoOuInativo,
  entradaInvalida,
  erroNaoAutenticado,
  erroSessaoInvalida,
  sessaoInvalida,
  usuarioNaoPodeAutenticar,
} from "./erros";

// Validadores
export {
  validarEmail,
  validarSenha,
  validarLocatarioId,
  validarTokenNaoVazio,
} from "./validadores";

// Repositório
export type {
  UsuariosRepositorioAuth,
  TokensRepositorio,
  RbacRepositorio,
  CriptoPorta,
  JwtPorta,
  LocatariosRepositorioAuth,
  TokensServicePorta,
  RbacServicePorta,
  CriptoAuthPorta,
  Relogio,
  EventosSegurancaPorta,
  IdPorta,
  RelogioPorta,
} from "./portasRepositorio";

// Casos de uso
export { criarEmitirSessao } from "./usecases/emitirSessao";
export { criarValidarSessao } from "./usecases/validarSessao";
export { criarRotacionarRefresh } from "./usecases/rotacionarRefresh";
export { criarResolverContextoAutorizado } from "./usecases/resolverContextoAutorizado";