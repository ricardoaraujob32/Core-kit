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

export { createFnEmitirToken } from "./usecases/emitirToken";
export { createFnObterTokenPorHash } from "./usecases/obterTokenPorHash";
export { createFnListarTokensDoUsuario } from "./usecases/listarTokensDoUsuario";
export { createFnRevogarToken } from "./usecases/revogarToken";
export { createFnRotacionarToken } from "./usecases/rotacionarToken";
