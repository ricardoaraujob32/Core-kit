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

export {
  locatarioInvalido,
  locatarioNaoEncontrado,
  locatarioSuspenso,
  locatarioEncerrado,
} from "./erros";

export {
  validarNomeLocatario,
  validarLocatarioId,
} from "./validadores";

export type { LocatariosRepositorio } from "./portasRepositorio";

export {
  criarLocatariosRepositorioMemoria,
  criarLocatarioSeed,
} from "./repositorioMemoria";

export { createCriarLocatario } from "./usecases/criarLocatario";
export { createObterLocatario } from "./usecases/obterLocatario";
export { createListarLocatarios } from "./usecases/listarLocatarios";