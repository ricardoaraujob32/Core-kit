// packages/core/src/modulos/index.ts

// Tipos
export type {
  ModuloCodigo,
  ModuloId,
  OrigemModuloHabilitado,
  ModuloHabilitado,
  ListarModulosHabilitadosInput,
  ListarModulosHabilitadosOutput,
  ModuloEstaHabilitadoInput,
  ModuloEstaHabilitadoOutput,
} from "./tipos";

// Erros
export {
  erroLocatarioIdInvalido,
  erroModuloCodigoInvalido,
  erroRepositorioModulos,
  erroModuloNaoHabilitado,
} from "./erros";

// Validadores
export {
  validarListarModulosHabilitadosInput,
  validarModuloEstaHabilitadoInput,
} from "./validadores";

// Repositório
export type {
  ModulosHabilitadosRepositorio,
} from "./portasRepositorio";
export {
  criarModulosHabilitadosRepositorioMemoria,
  EstadoModulosHabilitadosMemoria,
} from "./repositorioMemoria";

// Serviços
export type {
  ModulosHabilitadosService,
  CriarModulosHabilitadosServiceDeps,
} from "./usecases/modulosHabilitadosService";
export {
  createFnListarModulosHabilitados as criarModulosHabilitadosService,
} from "./usecases/modulosHabilitadosService";