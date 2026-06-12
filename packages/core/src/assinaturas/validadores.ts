// packages/core/src/assinaturas/validadores.ts

import { ErroApp, Result, validarData, validarIdGenerico, wrapOk } from "../kernel/index.js";
import { erroAssinaturaInvalida } from "./erros.js";
import { AtivarAssinaturaInput, CancelarAssinaturaInput, CriarAssinaturaInput, DesvincularModuloDaAssinaturaInput,
  ListarModulosHabilitadosLocatarioInput,
  SuspenderAssinaturaInput, VincularModuloNaAssinaturaInput } from "./tipos.js";

/**
 * Converte falhas dos validadores transversais em erro específico
 * do domínio de assinaturas.
 *
 * @param resultado Resultado da validação compartilhada.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor rejeitado.
 * @returns `Ok` original ou `Err` específico do módulo `assinaturas`.
 */
function mapearErro(resultado: Result<string | Date, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return erroAssinaturaInvalida({ campo, valor });
}

/**
 * Valida a entrada de criação de assinatura.
 *
 * Regras atuais:
 * - `locatarioId` válido;
 * - `planoId` válido;
 * - `iniciadaEm`, quando informada, deve ser data válida.
 *
 * @param input Entrada recebida para criação.
 * @returns `Ok(input)` quando os campos mínimos são válidos.
 */
export function validarCriarAssinaturaInput(input: CriarAssinaturaInput): Result<CriarAssinaturaInput, ErroApp> {
  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  const planoId = mapearErro( validarIdGenerico(input.planoId, "planoId"), "planoId", input.planoId );
  if (!planoId.ok) return planoId;

  if (input.iniciadaEm !== undefined) {
    const iniciadaEm = mapearErro( validarData(input.iniciadaEm, "iniciadaEm"), "iniciadaEm", input.iniciadaEm );
    if (!iniciadaEm.ok) return iniciadaEm;
  }

  return wrapOk(input);
}

/**
 * Valida a entrada de ativação de assinatura.
 *
 * @param input Entrada recebida para ativação.
 * @returns `Ok(input)` quando `assinaturaId` é válido.
 */
export function validarAtivarAssinaturaInput(input: AtivarAssinaturaInput): Result<AtivarAssinaturaInput, ErroApp> {
  const assinaturaId = mapearErro( validarIdGenerico(input.assinaturaId, "assinaturaId"), "assinaturaId", input.assinaturaId );
  if (!assinaturaId.ok) return assinaturaId;

  return wrapOk(input);
}

/**
 * Valida a entrada de suspensão de assinatura.
 *
 * @param input Entrada recebida para suspensão.
 * @returns `Ok(input)` quando `assinaturaId` é válido.
 */
export function validarSuspenderAssinaturaInput(input: SuspenderAssinaturaInput): Result<SuspenderAssinaturaInput, ErroApp> {
  const assinaturaId = mapearErro( validarIdGenerico(input.assinaturaId, "assinaturaId"), "assinaturaId", input.assinaturaId );
  if (!assinaturaId.ok) return assinaturaId;

  return wrapOk(input);
}

/**
 * Valida a entrada de cancelamento de assinatura.
 *
 * Regras atuais:
 * - `assinaturaId` válido;
 * - `encerradaEm`, quando informada, deve ser data válida.
 *
 * @param input Entrada recebida para cancelamento.
 * @returns `Ok(input)` quando os campos suportados são válidos.
 */
export function validarCancelarAssinaturaInput(input: CancelarAssinaturaInput): Result<CancelarAssinaturaInput, ErroApp> {
  const assinaturaId = mapearErro( validarIdGenerico(input.assinaturaId, "assinaturaId"), "assinaturaId", input.assinaturaId );
  if (!assinaturaId.ok) return assinaturaId;

  if (input.encerradaEm !== undefined) {
    const encerradaEm = mapearErro( validarData(input.encerradaEm, "encerradaEm"), "encerradaEm", input.encerradaEm );
    if (!encerradaEm.ok) return encerradaEm;
  }

  return wrapOk(input);
}

/**
 * Valida a entrada de vínculo de módulo a uma assinatura.
 *
 * @param input Entrada recebida para vinculação.
 * @returns `Ok(input)` quando `assinaturaId` e `moduloId` são válidos.
 */
export function validarVincularModuloNaAssinaturaInput(input: VincularModuloNaAssinaturaInput,
): Result<VincularModuloNaAssinaturaInput, ErroApp> {
  const assinaturaId = mapearErro( validarIdGenerico(input.assinaturaId, "assinaturaId"), "assinaturaId", input.assinaturaId );
  if (!assinaturaId.ok) return assinaturaId;

  const moduloId = mapearErro( validarIdGenerico(input.moduloId, "moduloId"), "moduloId", input.moduloId );
  if (!moduloId.ok) return moduloId;

  return wrapOk(input);
}

/**
 * Valida a entrada de desvínculo de módulo de uma assinatura.
 *
 * @param input Entrada recebida para desvinculação.
 * @returns `Ok(input)` quando `assinaturaId` e `moduloId` são válidos.
 */
export function validarDesvincularModuloDaAssinaturaInput(input: DesvincularModuloDaAssinaturaInput,
): Result<DesvincularModuloDaAssinaturaInput, ErroApp> {
  const assinaturaId = mapearErro( validarIdGenerico(input.assinaturaId, "assinaturaId"), "assinaturaId", input.assinaturaId );
  if (!assinaturaId.ok) return assinaturaId;

  const moduloId = mapearErro( validarIdGenerico(input.moduloId, "moduloId"), "moduloId", input.moduloId );
  if (!moduloId.ok) return moduloId;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarListarModulosHabilitadosLocatarioInput(input: ListarModulosHabilitadosLocatarioInput): Result<ListarModulosHabilitadosLocatarioInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );

  if (!locatarioId.ok) return locatarioId;

  return wrapOk(input);
}
