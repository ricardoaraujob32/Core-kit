// packages/core/src/auditoria/validadores.ts

import { type ErroApp, type Result, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
import { erroAuditoriaInvalida } from "./erros";
import type { ListarAuditoriaAtivaLocatarioInput, ListarAuditoriaInternaInput, RegistrarEventoAuditoriaInternaInput } from "./tipos";

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
 * Valida a entrada de registro da auditoria interna.
 *
 * Regras:
 * - `evento` obrigatório;
 * - `escopo` obrigatório;
 * - `locatarioId` obrigatório quando escopo for `LOCATARIO`;
 * - `usuarioId`, quando informado, deve ser válido.
 *
 * @param input Evento recebido para registro.
 * @returns `Ok(input)` quando a estrutura mínima for válida.
 */
export function validarRegistrarEventoAuditoriaInternaInput(input: RegistrarEventoAuditoriaInternaInput): Result<RegistrarEventoAuditoriaInternaInput, ErroApp> {
  const evento = mapearErro(validarTextoObrigatorio(input.evento, "evento", 1), "evento", input.evento);
  if (!evento.ok) return evento;

  if (input.escopo !== "PLATAFORMA" && input.escopo !== "LOCATARIO") {
    return erroAuditoriaInvalida({
      campo: "escopo",
      valor: input.escopo,
    });
  }

  if (input.escopo === "LOCATARIO") {
    const locatarioId = mapearErro(validarIdGenerico(input.locatarioId ?? "", "locatarioId"), "locatarioId", input.locatarioId);
    if (!locatarioId.ok) return locatarioId;
  }

  if (input.usuarioId !== undefined && input.usuarioId !== null) {
    const usuarioId = mapearErro(validarIdGenerico(input.usuarioId, "usuarioId"), "usuarioId", input.usuarioId);
    if (!usuarioId.ok) return usuarioId;
  }

  return wrapOk(input);
}

/**
 * Valida a entrada de listagem da auditoria interna.
 *
 * @param input Filtros recebidos.
 * @returns `Ok(input)` quando válidos.
 */
export function validarListarAuditoriaInternaInput(input: ListarAuditoriaInternaInput): Result<ListarAuditoriaInternaInput, ErroApp> {
  const limite = validarLimiteOpcional(input.limite);
  if (!limite.ok) return limite;

  const datas = validarIntervaloDatas(input.criadoDe, input.criadoAte);
  if (!datas.ok) return datas;

  if (input.locatarioId !== undefined) {
    const locatarioId = mapearErro(
      validarIdGenerico(input.locatarioId, "locatarioId"),
      "locatarioId",
      input.locatarioId,
    );
    if (!locatarioId.ok) return locatarioId;
  }

  if (input.usuarioId !== undefined) {
    const usuarioId = mapearErro(validarIdGenerico(input.usuarioId, "usuarioId"), "usuarioId", input.usuarioId);
    if (!usuarioId.ok) return usuarioId;
  }

  return wrapOk(input);
}

/**
 * Valida a entrada de listagem da auditoria ativa do locatário.
 *
 * Regras:
 * - `locatarioId` obrigatório;
 * - datas válidas;
 * - limite dentro da política do módulo.
 *
 * @param input Filtros recebidos.
 * @returns `Ok(input)` quando válidos.
 */
export function validarListarAuditoriaAtivaLocatarioInput(input: ListarAuditoriaAtivaLocatarioInput): Result<ListarAuditoriaAtivaLocatarioInput, ErroApp> {
  const locatarioId = mapearErro(validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId);
  if (!locatarioId.ok) return locatarioId;

  const limite = validarLimiteOpcional(input.limite);
  if (!limite.ok) return limite;

  const datas = validarIntervaloDatas(input.criadoDe, input.criadoAte);
  if (!datas.ok) return datas;

  if (input.usuarioId !== undefined) {
    const usuarioId = mapearErro(validarIdGenerico(input.usuarioId, "usuarioId"), "usuarioId", input.usuarioId);
    if (!usuarioId.ok) return usuarioId;
  }

  return wrapOk(input);
}
