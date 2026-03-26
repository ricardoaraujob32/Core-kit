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
export type { ModulosHabilitadosRepositorio } from "./portasRepositorio";

// Casos de uso
export { createFnListarModulosHabilitados } from "./usecases/listarModulosHabilitados";
export { createFnModuloEstaHabilitado } from "./usecases/moduloEstaHabilitado";
export { createFnExigirModuloHabilitado } from "./usecases/exigirModuloHabilitado";