// Ajuste os imports conforme o kernel real do projeto.
import type { Result } from "../result";
import { wrapErr } from "../result";
import type { ErroApp } from "../erros";

function criarErroApp(
  codigo:
    | "INVALIDO"
    | "NAO_ENCONTRADO"
    | "NAO_AUTORIZADO"
    | "ERRO_INTERNO",
  mensagem: string,
  detalhes?: Record<string, unknown>,
): ErroApp {
  return {
    codigo,
    mensagem,
    detalhes,
  };
}

export function erroLocatarioIdInvalido(
  locatarioId: unknown,
): Result<never, ErroApp> {
  return wrapErr(
    criarErroApp("INVALIDO", "locatarioId inválido.", { locatarioId }),
  );
}

export function erroModuloCodigoInvalido(
  codigo: unknown,
): Result<never, ErroApp> {
  return wrapErr(
    criarErroApp("INVALIDO", "Código do módulo inválido.", { codigo }),
  );
}

export function erroRepositorioModulos(
  causa?: unknown,
): Result<never, ErroApp> {
  return wrapErr(
    criarErroApp("ERRO_INTERNO", "Falha ao consultar módulos habilitados.", {
      causa,
    }),
  );
}

export function erroModuloNaoHabilitado(
  codigo: string,
  locatarioId: string,
): Result<never, ErroApp> {
  return wrapErr(
    criarErroApp("NAO_AUTORIZADO", "Módulo não habilitado para o locatário.", {
      codigo,
      locatarioId,
    }),
  );
}