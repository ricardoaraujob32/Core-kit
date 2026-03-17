// Ajuste os imports conforme o kernel real do projeto.
import type { Result } from "../result";
import { wrapErr } from "../result";
import type { ErroApp } from "../erros";
import { createErroApp } from "../ROPHelpers";

export function erroLocatarioIdInvalido(locatarioId: unknown): Result<never, ErroApp> {
  return createErroApp( {"INVALIDO", "locatarioId inválido.", { locatarioId } } );
}

export function erroModuloCodigoInvalido(codigo: unknown): Result<never, ErroApp> {
  return createErroApp("INVALIDO", "Código do módulo inválido.", { codigo }),
  );
}

export function erroRepositorioModulos(
  causa?: unknown,
): Result<never, ErroApp> {
  return createErroApp("ERRO_INTERNO", "Falha ao consultar módulos habilitados.", {
      causa,
    }),
  );
}

export function erroModuloNaoHabilitado(
  codigo: string,
  locatarioId: string,
): Result<never, ErroApp> {
  return createErroApp("NAO_AUTORIZADO", "Módulo não habilitado para o locatário.", {
      codigo,
      locatarioId,
    }),
  );
}