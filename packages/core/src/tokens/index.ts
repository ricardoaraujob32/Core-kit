// packages/core/src/tokens/index.ts

export type {
  TokenId,
  TokenTipo,
  TokenPersistido,
  EmitirTokenInput,
  EmitirTokenOutput,
  ObterTokenPorHashInput,
  RevogarTokenInput,
  RotacionarTokenInput,
  ListarTokensDoUsuarioInput,
  ListarTokensDoUsuarioOutput,
} from "./tipos";

export {
  tokenInvalido,
  tokenNaoEncontrado,
  tokenRevogado,
  tokenExpirado,
  hashTokenJaExiste,
} from "./erros";

export {
  validarTokenId,
  validarHashToken,
  validarTokenTipo,
  validarExpiraEm,
} from "./validadores";

export type { TokensRepositorio } from "./portasRepositorio";

export {
  criarTokensRepositorioMemoria,
  criarTokenSeed,
} from "./repositorioMemoria";

export { createEmitirToken } from "./usecases/emitirToken";
export { createObterTokenPorHash } from "./usecases/obterTokenPorHash";
export { createListarTokensDoUsuario } from "./usecases/listarTokensDoUsuario";
export { createRevogarToken } from "./usecases/revogarToken";
export { createRotacionarToken } from "./usecases/rotacionarToken";