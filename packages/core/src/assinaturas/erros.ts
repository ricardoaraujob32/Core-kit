import type { Result } from "../kernel/result";
import type { ErroApp } from "../kernel/erros";
import { createErroApp, wrapErr } from "../kernel/ROPHelpers";
import type {
  AssinaturaId,
  LocatarioId,
  ModuloId,
  PlanoId,
} from "./tipos";

export function erroAssinaturaInvalida(
  detalhes?: Record<string, unknown>,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp("ASSINATURA_INVALIDA", "Dados da assinatura são inválidos.", detalhes),
  );
}

export function erroAssinaturaNaoEncontrada(
  assinaturaId: AssinaturaId,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp("ASSINATURA_NAO_ENCONTRADA", "Assinatura não encontrada.", {
      assinaturaId,
    }),
  );
}

export function erroAssinaturaJaExisteParaLocatario(
  locatarioId: LocatarioId,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "ASSINATURA_ATIVA_JA_EXISTE",
      "Já existe uma assinatura ativa para este locatário.",
      { locatarioId },
    ),
  );
}

export function erroTransicaoStatusInvalida(
  assinaturaId: AssinaturaId,
  statusAtual: string,
  statusDestino: string,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "ASSINATURA_TRANSICAO_STATUS_INVALIDA",
      "A transição de status da assinatura é inválida.",
      { assinaturaId, statusAtual, statusDestino },
    ),
  );
}

export function erroPlanoInvalido(planoId: PlanoId): Result<never, ErroApp> {
  return wrapErr(
    createErroApp("PLANO_INVALIDO", "Plano inválido ou inativo.", { planoId }),
  );
}

export function erroModuloInvalido(moduloId: ModuloId): Result<never, ErroApp> {
  return wrapErr(
    createErroApp("MODULO_INVALIDO", "Módulo inválido ou inativo.", { moduloId }),
  );
}

export function erroModuloJaVinculado(
  assinaturaId: AssinaturaId,
  moduloId: ModuloId,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "MODULO_ASSINATURA_JA_VINCULADO",
      "O módulo já está vinculado à assinatura.",
      { assinaturaId, moduloId },
    ),
  );
}

export function erroModuloNaoVinculado(
  assinaturaId: AssinaturaId,
  moduloId: ModuloId,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "MODULO_ASSINATURA_NAO_VINCULADO",
      "O módulo não está vinculado à assinatura.",
      { assinaturaId, moduloId },
    ),
  );
}