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
} from "./tipos";

export { Permissoes } from "./tipos";

export {
  permissaoInvalida,
  naoAutenticado,
  naoAutorizado,
} from "./erros";

export { validarPermissao } from "./validadores";

export type { RbacRepositorio, AutorizacaoRepositorio } from "./portasRepositorio";

// export { criarRbacRepositorioMemoria } from "./repositorioMemoria";

export { createFnResolverPermissoes } from "./usecases/resolverPermissoes";

export { autorizarOperacao } from "./usecases/autorizarOperacao";

export { createFnResolverAutorizacao } from "./usecases/resolverAutorizacao";