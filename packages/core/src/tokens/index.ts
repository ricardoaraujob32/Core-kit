// packages/core/src/tokens/index.ts

export type {
  TokenId,
  TokenTipo,
  TokenPersistido,
  EmitirTokenInput,
  EmitirTokenOutput,
  EmitirTokenResult,
  ObterTokenPorHashInput,
  ObterTokenPorHashOutput,
  ObterTokenPorHashResult,
  RevogarTokenInput,
  RevogarTokenOutput,
  RevogarTokenResult,
  RotacionarTokenInput,
  RotacionarTokenOutput,
  RotacionarTokenResult,
  ListarTokensDoUsuarioInput,
  ListarTokensDoUsuarioOutput,
  ListarTokensDoUsuarioResult
} from "./tipos.js";

export {
  tokenInvalido,
  tokenNaoEncontrado,
  tokenRevogado,
  tokenExpirado,
  hashTokenJaExiste,
} from "./erros.js";

export {
  validarTokenId,
  validarHashToken,
  validarTokenTipo,
  validarExpiraEm,
} from "./validadores.js";

export type { TokensRepositorio } from "./portasRepositorio.js";



export { createFnEmitirToken } from "./usecases/emitirToken.js";
export { createFnObterTokenPorHash } from "./usecases/obterTokenPorHash.js";
export { createFnListarTokensDoUsuario } from "./usecases/listarTokensDoUsuario.js";
export { createFnRevogarToken } from "./usecases/revogarToken.js";
export { createFnRotacionarToken } from "./usecases/rotacionarToken.js";
