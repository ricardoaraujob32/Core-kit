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
} from "./tipos";

export type {
  AssinaturasRepositorio,
  AssinaturasModulosRepositorio,
  PlanosConsultaRepositorio,
  ModulosConsultaRepositorio,
} from "./portasRepositorio";

export { createFnAtivarAssinatura } from "./usecases/ativarAssinatura";
export { createFnCancelarAssinatura } from "./usecases/cancelarAssinatura";
export { createFnCriarAssinatura } from "./usecases/criarAssinatura";
export { createFnDesvincularModuloDaAssinatura } from "./usecases/desvincularModuloDaAssinatura";
export { createFnListarModulosHabilitadosLocatario } from "./usecases/listarModulosHabilitadosLocatario";
export { createFnSuspenderAssinatura } from "./usecases/suspenderAssinatura";
export { createFnVincularModuloNaAssinatura } from "./usecases/vincularModuloNaAssinatura";

// export {
//   AssinaturasRepositorioMemoria,
//   AssinaturasModulosRepositorioMemoria,
//   PlanosConsultaRepositorioMemoria,
//   ModulosConsultaRepositorioMemoria,
// } from "./repositorioMemoria";