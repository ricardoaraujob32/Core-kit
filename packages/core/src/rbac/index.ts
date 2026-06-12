// packages/core/src/rbac/index.ts

export type {
  Papel,
  PAPEIS_PADRAO,
  Permissao,
  PapelPadrao,
  AutorizacaoSnapshot,
  ResolverPermissoesInput,
  ResolverPermissoesOutput,
  ResolverPermissoesResult,
  AutorizarOperacaoInput,
  AutorizarOperacaoResult,
  ResolverAutorizacaoInput,
  ResolverAutorizacaoOutput,
  ResolverAutorizacaoResult
} from "./tipos.js";

export { Permissoes } from "./tipos.js";

export {
  permissaoInvalida,
  naoAutenticado,
  naoAutorizado,
} from "./erros.js";

export { validarPermissao } from "./validadores.js";

export type { RbacRepositorio, AutorizacaoRepositorio } from "./portasRepositorio.js";

// export { criarRbacRepositorioMemoria } from "./repositorioMemoria.js";

export { createFnResolverPermissoes } from "./usecases/resolverPermissoes.js";

export { autorizarOperacao } from "./usecases/autorizarOperacao.js";

export { createFnResolverAutorizacao } from "./usecases/resolverAutorizacao.js";