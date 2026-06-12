// packages/core/src/modulos/index.ts

// Tipos
export type {
  ModuloCodigo,
  ModuloId,
  OrigemModuloHabilitado,
  ModuloHabilitado,
  ListarModulosHabilitadosInput,
  ListarModulosHabilitadosOutput,
  ListarModulosHabilitadosResult,
  ModuloEstaHabilitadoInput,
  ModuloEstaHabilitadoOutput,
  ModuloEstaHabilitadoResult,
  ResolverModulosHabilitadosInput,
  ResolverModulosHabilitadosOutput,
  ResolverModulosHabilitadosResult,
} from "./tipos.js";

// Erros
export {
  erroLocatarioIdInvalido,
  erroModuloCodigoInvalido,
  erroRepositorioModulos,
  erroModuloNaoHabilitado,
} from "./erros.js";

// Validadores
export {
  validarListarModulosHabilitadosInput,
  validarModuloEstaHabilitadoInput,
} from "./validadores.js";

// Repositório
export type { ModulosHabilitadosRepositorio } from "./portasRepositorio.js";

// Casos de uso
export { createFnListarModulosHabilitados } from "./usecases/listarModulosHabilitados.js";
export { createFnModuloEstaHabilitado } from "./usecases/moduloEstaHabilitado.js";
export { createFnExigirModuloHabilitado } from "./usecases/exigirModuloHabilitado.js";
export { createFnResolverModulosHabilitados } from "./usecases/resolverModulosHabilitados.js";