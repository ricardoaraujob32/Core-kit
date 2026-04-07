export type {
  LocatarioId,
  LocatarioSlug,
  LocatarioStatus,
  Locatario,
  CriarLocatarioInput,
  CriarLocatarioOutput,
  CriarLocatarioResult,
  ListarLocatariosInput,
  ListarLocatariosOutput,
  ListarLocatariosResult,
  ObterLocatarioInput,
  ObterLocatarioOutput,
  ObterLocatarioResult  
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
  validarLocatarioSlug
} from "./validadores";

export type { LocatariosRepositorio } from "./portasRepositorio";



export { createFnCriarLocatario } from "./usecases/criarLocatario";
export { createFnObterLocatario } from "./usecases/obterLocatario";
export { createFnListarLocatarios } from "./usecases/listarLocatarios";