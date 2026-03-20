// packages/core/src/rbac/index.ts

export type {
  Papel,
  Permissao,
  ContextoExecucaoRbac,
  ResolverPermissoesInput,
  ResolverPermissoesOutput,
  AutorizarOperacaoInput,
} from "./tipos";

export {
  permissaoInvalida,
  naoAutenticado,
  naoAutorizado,
} from "./erros";

export { validarPermissao } from "./validadores";

export type { RbacRepositorio } from "./portasRepositorio";

export { criarRbacRepositorioMemoria } from "./repositorioMemoria";

export { createFnResolverPermissoes } from "./usecases/resolverPermissoes";

export { autorizarOperacao } from "./usecases/autorizarOperacao";