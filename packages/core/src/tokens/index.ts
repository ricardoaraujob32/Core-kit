// packages/core/src/tokens/index.ts

// Tipos
export type {
  TokenId,
  TokenTipo,
  TokenPersistido,
  CriarRefreshInput,
  RefreshCriado,
  ValidarRefreshInput,
  RefreshValido,
  RevogarTokenInput,
  ResultadoCriarRefresh,
  ResultadoValidarRefresh,
  ResultadoRevogarToken,
} from "./tipos";

// Erros
export {
  entradaInvalida,
  tokenNaoAutenticado,
  conflitoRotacao,
} from "./erros";

// Validadores
export {
  validarLocatarioId,
  validarUsuarioId,
  validarTokenBruto,
  validarTtl,
  validarAgora,
} from "./validadores";

// Repositório
export type {
  TokensRepositorio,
  CriptoTokensPorta,
  IdPorta,
} from "./portasRepositorio";

export {
  criarTokensRepositorioMemoria,
} from "./repositorioMemoria";

// Casos de uso
export { criarRevogarToken } from "./usecases/revogarToken";
export { criarCriarRefreshToken } from "./usecases/criarRefreshToken";
export { criarValidarRefreshToken } from "./usecases/validarRefreshToken";
