// packages/core/src/assinaturas/index.ts

export { criarAssinaturasService } from "./usecases/assinaturasService";

export type {
  Assinatura,
  AssinaturaId,
  StatusAssinatura,
  CriarAssinaturaInput,
  CriarAssinaturaOutput,
  AtivarAssinaturaInput,
  SuspenderAssinaturaInput,
  CancelarAssinaturaInput,
  VincularModuloNaAssinaturaInput,
  DesvincularModuloDaAssinaturaInput,
  ListarModulosHabilitadosLocatarioInput,
  ListarModulosHabilitadosLocatarioOutput,
} from "./tipos";

export type {
  AssinaturasRepositorio,
  AssinaturasModulosRepositorio,
  PlanosConsultaRepositorio,
  ModulosConsultaRepositorio,
  PortaTransacao,
} from "./portasRepositorio";

export {
  AssinaturasRepositorioMemoria,
  AssinaturasModulosRepositorioMemoria,
  PlanosConsultaRepositorioMemoria,
  ModulosConsultaRepositorioMemoria,
} from "./repositorioMemoria";