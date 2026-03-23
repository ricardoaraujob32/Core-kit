// packages/core/src/auditoria/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
import { erroAuditoriaInvalida } from "./erros";
import { ListarAuditoriaLocatarioInput, ListarAuditoriaPlataformaInput, RegistrarEventoLocatarioInput,
  RegistrarEventoPlataformaInput } from "./tipos";

/**
 * Converte falhas dos validadores transversais em erro específico
 * do domínio de auditoria.
 *
 * @param resultado Resultado da validação compartilhada.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor rejeitado.
 * @returns `Ok` original ou `Err` específico do módulo `auditoria`.
 */
function mapearErro(resultado: Result<string | number, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return erroAuditoriaInvalida({ campo, valor });
}

/**
 * Valida o limite opcional usado em consultas de auditoria.
 *
 * Regras atuais:
 * - `undefined` é aceito;
 * - quando informado, deve ser número positivo;
 * - deve ser inteiro;
 * - não pode ultrapassar 500.
 *
 * @param limite Limite opcional recebido na consulta.
 * @returns `Ok(undefined)` quando ausente, ou `Ok(limite)` quando válido.
 */
function validarLimiteOpcional(limite?: number): Result<number | undefined, ErroApp> {
  if (limite === undefined) {
    return wrapOk(undefined);
  }

  const res = validarNumeroPositivo(limite, "limite");
  if (!res.ok) return erroAuditoriaInvalida({ campo: "limite", valor: limite });

  if (!Number.isInteger(limite) || limite > 500) {
    return erroAuditoriaInvalida({ campo: "limite", valor: limite });
  }

  return wrapOk(limite);
}

/**
 * Valida a entrada de registro de evento de auditoria no escopo de locatário.
 *
 * Regras atuais:
 * - `locatarioId` válido;
 * - `usuarioId` válido;
 * - `evento` obrigatório.
 *
 * @param input Evento recebido para registro.
 * @returns `Ok(input)` quando os campos mínimos são válidos.
 */
export function validarRegistrarEventoLocatarioInput(input: RegistrarEventoLocatarioInput): Result<RegistrarEventoLocatarioInput, ErroApp> {
  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  const usuarioId = mapearErro( validarIdGenerico(input.usuarioId, "usuarioId"), "usuarioId", input.usuarioId );
  if (!usuarioId.ok) return usuarioId;

  const evento = mapearErro( validarTextoObrigatorio(input.evento, "evento", 1), "evento", input.evento );
  if (!evento.ok) return evento;

  return wrapOk(input);
}

/**
 * Valida a entrada de registro de evento de auditoria no escopo de plataforma.
 *
 * Regras atuais:
 * - `usuarioId` válido;
 * - `evento` obrigatório.
 *
 * @param input Evento recebido para registro.
 * @returns `Ok(input)` quando os campos mínimos são válidos.
 */
export function validarRegistrarEventoPlataformaInput(input: RegistrarEventoPlataformaInput): Result<RegistrarEventoPlataformaInput, ErroApp> {
  const usuarioId = mapearErro( validarIdGenerico(input.usuarioId, "usuarioId"), "usuarioId",  input.usuarioId );
  if (!usuarioId.ok) return usuarioId;

  const evento = mapearErro( validarTextoObrigatorio(input.evento, "evento", 1), "evento", input.evento );
  if (!evento.ok) return evento;

  return wrapOk(input);
}

/**
 * Valida a entrada de listagem de auditoria de locatário.
 *
 * Regras atuais:
 * - `locatarioId` válido;
 * - `limite`, quando informado, deve respeitar a política do módulo.
 *
 * @param input Filtro de consulta recebido.
 * @returns `Ok(input)` quando a estrutura mínima é válida.
 */
export function validarListarAuditoriaLocatarioInput(input: ListarAuditoriaLocatarioInput): Result<ListarAuditoriaLocatarioInput, ErroApp> {
  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  const limite = validarLimiteOpcional(input.limite);
  if (!limite.ok) return limite;

  return wrapOk(input);
}

/**
 * Valida a entrada de listagem de auditoria de plataforma.
 *
 * No estado atual, apenas o `limite` opcional é validado localmente.
 *
 * @param input Filtro de consulta recebido.
 * @returns `Ok(input)` quando os campos suportados são válidos.
 */
export function validarListarAuditoriaPlataformaInput(input: ListarAuditoriaPlataformaInput): Result<ListarAuditoriaPlataformaInput, ErroApp> {
  const limite = validarLimiteOpcional(input.limite);
  if (!limite.ok) return limite;

  return wrapOk(input);
}
