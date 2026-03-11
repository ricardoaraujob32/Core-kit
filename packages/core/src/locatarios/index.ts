// packages/core/src/locatarios/index.ts

// Tipos
export type {
  LocatarioId,
  LocatarioStatus,
  Locatario,
  CriarLocatarioInput,
  CriarLocatarioOutput,
  ListarLocatariosOutput,
  ObterLocatarioInput,
  ResultadoObterLocatario,
  ResultadoCriarLocatario,
  ResultadoListarLocatarios,
} from "./tipos";

// Erros
export {
  locatarioInvalido,
  locatarioNaoEncontrado,
  locatarioSuspenso,
  locatarioEncerrado,
} from "./erros";

// Validadores
export {
  validarNomeLocatario,
  validarLocatarioId,
} from "./validadores";

// Repositório
export type {
  LocatariosRepositorio,
  IdPorta,
  RelogioPorta,
} from "./portasRepositorio";
export {
  criarLocatariosRepositorioMemoria,
  criarLocatarioSeed,
} from "./repositorioMemoria";

// Casos de uso
export { criarCriarLocatario } from "./usecases/criarLocatario";
export { criarObterLocatario } from "./usecases/obterLocatario";
export { criarListarLocatarios } from "./usecases/listarLocatarios";