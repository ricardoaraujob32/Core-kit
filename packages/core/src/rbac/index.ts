// packages/core/src/rbac/index.ts

// Tipos
export type {
  ResolverPermissoesInput,
  ResolverPermissoesOutput,
  AutorizarOperacaoInput,
  ResultadoResolverPermissoes,
  ResultadoAutorizarOperacao,
} from "./tipos";

// Erros
export {
  permissaoInvalida,
  naoAutorizado,
} from "./erros";

// Validadores
export {
  validarPermissao,
} from "./validadores";

// Repositório
export type {
  RbacRepositorio,
} from "./portasRepositorio";
export {
  criarRbacRepositorioMemoria,
} from "./repositorioMemoria";

// Casos de uso
export { autorizarOperacao } from "./usecases/autorizarOperacao";
export { resolverPermissoes } from "./usecases/resolverPermissoes";