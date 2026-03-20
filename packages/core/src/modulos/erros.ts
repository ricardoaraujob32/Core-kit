// packages/core/src/modulos/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel"
import { LocatarioId } from "../locatarios"

/**
 * 
 * @param locatarioId 
 * @returns 
 */
export function erroLocatarioIdInvalido(locatarioId: unknown): Result<never, ErroApp> {
  return createErroApp( {"INVALIDO", "locatarioId inválido.", { locatarioId } } );
}

/**
 * 
 * @param codigo 
 * @returns 
 */
export function erroModuloCodigoInvalido(codigo: unknown): Result<never, ErroApp> {
  return createErroApp("INVALIDO", "Código do módulo inválido.", { codigo }),
  );
}

/**
 * 
 * @param causa 
 * @returns 
 */
export function erroRepositorioModulos(causa?: unknown): Result<never, ErroApp> {
  return createErroApp("ERRO_INTERNO", "Falha ao consultar módulos habilitados.", {
      causa,
    }),
  );
}

/**
 * 
 * @param codigo 
 * @param locatarioId 
 * @returns 
 */
export function erroModuloNaoHabilitado(codigo: string, locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp("NAO_AUTORIZADO", "Módulo não habilitado para o locatário.", {
      codigo,
      locatarioId,
    }),
  );
}
