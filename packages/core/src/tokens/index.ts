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

export { createFnEmitirToken as createEmitirToken } from "./usecases/emitirToken";
export { createFnObterTokenPorHash as createObterTokenPorHash } from "./usecases/obterTokenPorHash";
export { createFnListarTokensDoUsuario as createListarTokensDoUsuario } from "./usecases/listarTokensDoUsuario";
export { createFnRevogarToken as createRevogarToken } from "./usecases/revogarToken";
export { createFnRotacionarToken as createRotacionarToken } from "./usecases/rotacionarToken";
