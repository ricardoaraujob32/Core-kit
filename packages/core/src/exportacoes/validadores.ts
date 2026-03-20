// packages/core/src/exportacoes/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio, wrapOk } from "../kernel";
import { erroExportacaoInvalida } from "./erros";
import { ListarExportacoesLocatarioInput, MarcarExportacaoComFalhaInput, MarcarExportacaoConcluidaInput, 
  MarcarExportacaoEmExecucaoInput, SolicitarExportacaoInput } from "./tipos";

/**
 * 
 * @param resultado 
 * @param campo 
 * @param valor 
 * @returns 
 */
function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return erroExportacaoInvalida({ campo, valor });
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarSolicitarExportacaoInput(input: SolicitarExportacaoInput): Result<SolicitarExportacaoInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  if (!["CSV", "XLSX", "JSON", "PDF"].includes(input.formato)) {
    return erroExportacaoInvalida({ campo: "formato", valor: input.formato });
  }

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarListarExportacoesLocatarioInput(input: ListarExportacoesLocatarioInput): Result<ListarExportacoesLocatarioInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarMarcarExportacaoEmExecucaoInput(input: MarcarExportacaoEmExecucaoInput): Result<MarcarExportacaoEmExecucaoInput, ErroApp> {
  const exportacaoId = mapearErro(
    validarIdGenerico(input.exportacaoId, "exportacaoId"),
    "exportacaoId",
    input.exportacaoId,
  );
  if (!exportacaoId.ok) return exportacaoId;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarMarcarExportacaoConcluidaInput(input: MarcarExportacaoConcluidaInput): Result<MarcarExportacaoConcluidaInput, ErroApp> {
  const exportacaoId = mapearErro(
    validarIdGenerico(input.exportacaoId, "exportacaoId"),
    "exportacaoId",
    input.exportacaoId,
  );
  if (!exportacaoId.ok) return exportacaoId;

  const referenciaResultado = mapearErro(
    validarTextoObrigatorio(input.referenciaResultado, "referenciaResultado", 1),
    "referenciaResultado",
    input.referenciaResultado,
  );
  if (!referenciaResultado.ok) return referenciaResultado;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarMarcarExportacaoComFalhaInput(input: MarcarExportacaoComFalhaInput): Result<MarcarExportacaoComFalhaInput, ErroApp> {
  const exportacaoId = mapearErro(
    validarIdGenerico(input.exportacaoId, "exportacaoId"),
    "exportacaoId",
    input.exportacaoId,
  );
  if (!exportacaoId.ok) return exportacaoId;

  const mensagemErro = mapearErro(
    validarTextoObrigatorio(input.mensagemErro, "mensagemErro", 1),
    "mensagemErro",
    input.mensagemErro,
  );
  if (!mensagemErro.ok) return mensagemErro;

  return wrapOk(input);
}
