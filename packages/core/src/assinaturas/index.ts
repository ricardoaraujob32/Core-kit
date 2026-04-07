// packages/core/src/assinaturas/index.ts

export type {
  Assinatura,
  AssinaturaId,
  PlanoId,
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

// export {
//   AssinaturasRepositorioMemoria,
//   AssinaturasModulosRepositorioMemoria,
//   PlanosConsultaRepositorioMemoria,
//   ModulosConsultaRepositorioMemoria,
// } from "./repositorioMemoria";