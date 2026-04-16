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
  ObterLocatarioResult,
  AtivarConfiguracaoLocatarioInput,
  AtualizarConfiguracaoLocatarioInput,
  AtualizarLocatarioInput,
  AtualizarLocatarioOutput,
  AtualizarLocatarioResult,
  ConfiguracaoLocatario,
  ConfiguracaoLocatarioId,
  CriarConfiguracaoLocatarioInput,
  EncerrarLocatarioInput,
  EventoLocatario,
  ModoTemaLocatario,
  ReativarLocatarioInput,
  SuspenderLocatarioInput,
  SuspenderLocatarioResult  
} from "./tipos";

export {
  locatarioInvalido,
  locatarioNaoEncontrado,
  locatarioSuspenso,
  locatarioEncerrado,
  emailLocatarioJaExiste,
  slugLocatarioJaExiste
} from "./erros";

export {
  validarNomeLocatario,
  validarLocatarioId,
  validarLocatarioSlug,
  configuracaoLocatarioEstaCompleta,
  obterConfiguracaoAtiva,
  validarConfiguracaoLocatarioId
} from "./validadores";

export type { LocatariosRepositorio } from "./portasRepositorio";

export { createFnCriarLocatario } from "./usecases/criarLocatario";
export { createFnObterLocatario } from "./usecases/obterLocatario";
export { createFnAtivarConfiguracaoLocatario } from "./usecases/ativarConfiguracaoLocatario";
export { createFnAtualizarConfiguracaoLocatario } from "./usecases/atualizarConfiguracaoLocatario";
export { createFnAtualizarLocatario } from "./usecases/atualizarLocatario";
export { createFnCriarConfiguracaoLocatario } from "./usecases/criarConfiguracaoLocatario";
export { createFnEncerrarLocatario } from "./usecases/encerrarLocatario";
export { createFnListarLocatarios } from "./usecases/listarLocatarios";
export { createFnReativarLocatario } from "./usecases/reativarLocatario";
export { createFnSuspenderLocatario } from "./usecases/suspenderLocatario";
