// packages/core/src/auditoria/validadores.ts

import { type ErroApp, type Result, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
import { erroAuditoriaInvalida } from "./erros";
import type { ListarAuditoriaLocatarioInput, ListarAuditoriaPlataformaInput, RegistrarEventoAuditoriaLocatarioInput, RegistrarEventoAuditoriaPlataformaInput } from "./tipos";

/**
 * Converte erro de validação transversal em erro específico de auditoria.
 *
 * @param resultado Resultado bruto do validador compartilhado.
 * @param campo Nome lógico do campo.
 * @param valor Valor rejeitado.
 * @returns Resultado mapeado para o domínio de auditoria.
 */
function mapearErro<T>(resultado: Result<T, ErroApp>, campo: string, valor?: unknown): Result<T, ErroApp> {
  if (resultado.ok) return resultado;
  return erroAuditoriaInvalida({ campo, valor });
}

/**
 * Valida limite opcional de paginação.
 *
 * Regras:
 * - `undefined` é aceito;
 * - deve ser inteiro positivo;
 * - máximo de 500.
 *
 * @param limite Limite recebido.
 * @returns `Ok(undefined)` ou `Ok(limite)`.
 */
function validarLimiteOpcional(limite?: number): Result<number | undefined, ErroApp> {
  if (limite === undefined) return wrapOk(undefined);

  const res = validarNumeroPositivo(limite, "limite");
  if (!res.ok) return erroAuditoriaInvalida({ campo: "limite", valor: limite });

  if (!Number.isInteger(limite) || limite > 500) {
    return erroAuditoriaInvalida({ campo: "limite", valor: limite });
  }

  return wrapOk(limite);
}

/**
 * Valida coerência básica do intervalo de datas.
 *
 * @param criadoDe Data inicial.
 * @param criadoAte Data final.
 * @returns `Ok(void)` quando o intervalo é válido.
 */
function validarIntervaloDatas(criadoDe?: Date, criadoAte?: Date): Result<void, ErroApp> {
  if (criadoDe && Number.isNaN(criadoDe.getTime())) {
    return erroAuditoriaInvalida({ campo: "criadoDe", valor: criadoDe });
  }

  if (criadoAte && Number.isNaN(criadoAte.getTime())) {
    return erroAuditoriaInvalida({ campo: "criadoAte", valor: criadoAte });
  }

  if (criadoDe && criadoAte && criadoDe.getTime() > criadoAte.getTime()) {
    return erroAuditoriaInvalida({
      campo: "intervaloDatas",
      criadoDe,
      criadoAte,
    });
  }

  return wrapOk(undefined);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarRegistrarEventoAuditoriaLocatarioInput(input: RegistrarEventoAuditoriaLocatarioInput): Result<RegistrarEventoAuditoriaLocatarioInput, ErroApp> {
  const evento = mapearErro(
    validarTextoObrigatorio(input.evento, "evento", 1),
    "evento",
    input.evento,
  );
  if (!evento.ok) return evento;

  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  if (input.usuarioId !== undefined && input.usuarioId !== null) {
    const usuarioId = mapearErro(
      validarIdGenerico(input.usuarioId, "usuarioId"),
      "usuarioId",
      input.usuarioId,
    );
    if (!usuarioId.ok) return usuarioId;
  }

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarRegistrarEventoAuditoriaPlataformaInput(input: RegistrarEventoAuditoriaPlataformaInput): Result<RegistrarEventoAuditoriaPlataformaInput, ErroApp> {
  const evento = mapearErro(
    validarTextoObrigatorio(input.evento, "evento", 1),
    "evento",
    input.evento,
  );
  if (!evento.ok) return evento;

  if (input.superadminUsuarioId !== undefined && input.superadminUsuarioId !== null) {
    const superadminUsuarioId = mapearErro(
      validarIdGenerico(input.superadminUsuarioId, "superadminUsuarioId"),
      "superadminUsuarioId",
      input.superadminUsuarioId,
    );
    if (!superadminUsuarioId.ok) return superadminUsuarioId;
  }

  if (input.locatarioAlvoId !== undefined && input.locatarioAlvoId !== null) {
    const locatarioAlvoId = mapearErro(
      validarIdGenerico(input.locatarioAlvoId, "locatarioAlvoId"),
      "locatarioAlvoId",
      input.locatarioAlvoId,
    );
    if (!locatarioAlvoId.ok) return locatarioAlvoId;
  }

  return wrapOk(input);
}

export function validarListarAuditoriaLocatarioInput(input: ListarAuditoriaLocatarioInput): Result<ListarAuditoriaLocatarioInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  const limite = validarLimiteOpcional(input.limite);
  if (!limite.ok) return limite;

  const datas = validarIntervaloDatas(input.criadoDe, input.criadoAte);
  if (!datas.ok) return datas;

  if (input.usuarioId !== undefined) {
    const usuarioId = mapearErro(
      validarIdGenerico(input.usuarioId, "usuarioId"),
      "usuarioId",
      input.usuarioId,
    );
    if (!usuarioId.ok) return usuarioId;
  }

  return wrapOk(input);
}

export function validarListarAuditoriaPlataformaInput(input: ListarAuditoriaPlataformaInput): Result<ListarAuditoriaPlataformaInput, ErroApp> {
  const limite = validarLimiteOpcional(input.limite);
  if (!limite.ok) return limite;

  const datas = validarIntervaloDatas(input.criadoDe, input.criadoAte);
  if (!datas.ok) return datas;

  if (input.superadminUsuarioId !== undefined) {
    const superadminUsuarioId = mapearErro(
      validarIdGenerico(input.superadminUsuarioId, "superadminUsuarioId"),
      "superadminUsuarioId",
      input.superadminUsuarioId,
    );
    if (!superadminUsuarioId.ok) return superadminUsuarioId;
  }

  if (input.locatarioAlvoId !== undefined) {
    const locatarioAlvoId = mapearErro(
      validarIdGenerico(input.locatarioAlvoId, "locatarioAlvoId"),
      "locatarioAlvoId",
      input.locatarioAlvoId,
    );
    if (!locatarioAlvoId.ok) return locatarioAlvoId;
  }

  return wrapOk(input);
}
