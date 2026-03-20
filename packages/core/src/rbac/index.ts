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

export {
  temUsuario,
  exigirUsuario,
  normalizarPermissoes,
  normalizarPapeis,
  comPermissoes,
  comPapeis,
} from "./helpers";

export { createFnResolverPermissoes as createResolverPermissoes } from "./usecases/resolverPermissoes";
export { autorizarOperacao } from "./usecases/autorizarOperacao";