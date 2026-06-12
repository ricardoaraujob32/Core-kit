// packages/core/src/assinaturas/index.ts

export type {
  Assinatura,
  AssinaturaId,
  PlanoId,
  EventoAssinatura,
  ListarModulosGratisResult,
  ModuloHabilitadoAssinatura,
  ModuloHabilitadoLocatario,
  RegistrarAssinaturaParams,
  RegistrarModuloAssinaturaParams,
  ValidarModuloExistenteResult,
  ValidarPlanoAtivoResult,
  StatusAssinatura,
  CriarAssinaturaInput,
  CriarAssinaturaOutput,
  CriarAssinaturaResult,
  AtivarAssinaturaInput,
  AtivarAssinaturaOutput,
  AtivarAssinaturaResult,
  SuspenderAssinaturaInput,
  SuspenderAssinaturaOutput,
  SuspenderAssinaturaResult,
  CancelarAssinaturaInput,
  CancelarAssinaturaOutput,
  CancelarAssinaturaResult,
  VincularModuloNaAssinaturaInput,
  VincularModuloNaAssinaturaOutput,
  VincularModuloNaAssinaturaResult,
  DesvincularModuloDaAssinaturaInput,
  DesvincularModuloDaAssinaturaOutput,
  DesvincularModuloDaAssinaturaResult,
  ListarModulosHabilitadosLocatarioInput,
  ListarModulosHabilitadosLocatarioOutput,
  ListarModulosHabilitadosLocatarioResult
} from "./tipos.js";

export type {
  AssinaturasRepositorio,
  AssinaturasModulosRepositorio,
  PlanosConsultaRepositorio,
  ModulosConsultaRepositorio,
} from "./portasRepositorio.js";

export { createFnAtivarAssinatura } from "./usecases/ativarAssinatura.js";
export { createFnCancelarAssinatura } from "./usecases/cancelarAssinatura.js";
export { createFnCriarAssinatura } from "./usecases/criarAssinatura.js";
export { createFnDesvincularModuloDaAssinatura } from "./usecases/desvincularModuloDaAssinatura.js";
export { createFnListarModulosHabilitadosLocatario } from "./usecases/listarModulosHabilitadosLocatario.js";
export { createFnSuspenderAssinatura } from "./usecases/suspenderAssinatura.js";
export { createFnVincularModuloNaAssinatura } from "./usecases/vincularModuloNaAssinatura.js";

// export {
//   AssinaturasRepositorioMemoria,
//   AssinaturasModulosRepositorioMemoria,
//   PlanosConsultaRepositorioMemoria,
//   ModulosConsultaRepositorioMemoria,
// } from "./repositorioMemoria.js";