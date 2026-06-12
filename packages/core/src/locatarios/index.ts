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
} from "./tipos.js";

export {
  locatarioInvalido,
  locatarioNaoEncontrado,
  locatarioSuspenso,
  locatarioEncerrado,
  emailLocatarioJaExiste,
  slugLocatarioJaExiste
} from "./erros.js";

export {
  validarNomeLocatario,
  validarLocatarioId,
  validarLocatarioSlug,
  configuracaoLocatarioEstaCompleta,
  obterConfiguracaoAtiva,
  validarConfiguracaoLocatarioId
} from "./validadores.js";

export type { LocatariosRepositorio } from "./portasRepositorio.js";

export { createFnCriarLocatario } from "./usecases/criarLocatario.js";
export { createFnObterLocatario } from "./usecases/obterLocatario.js";
export { createFnAtivarConfiguracaoLocatario } from "./usecases/ativarConfiguracaoLocatario.js";
export { createFnAtualizarConfiguracaoLocatario } from "./usecases/atualizarConfiguracaoLocatario.js";
export { createFnAtualizarLocatario } from "./usecases/atualizarLocatario.js";
export { createFnCriarConfiguracaoLocatario } from "./usecases/criarConfiguracaoLocatario.js";
export { createFnEncerrarLocatario } from "./usecases/encerrarLocatario.js";
export { createFnListarLocatarios } from "./usecases/listarLocatarios.js";
export { createFnReativarLocatario } from "./usecases/reativarLocatario.js";
export { createFnSuspenderLocatario } from "./usecases/suspenderLocatario.js";
