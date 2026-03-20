// packages/core/src/importacoes/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
import { erroImportacaoInvalida } from "./erros";
import { ListarImportacoesLocatarioInput, ListarItensImportacaoInput, MarcarImportacaoComFalhaInput, MarcarImportacaoConcluidaInput,
  MarcarImportacaoEmExecucaoInput, MarcarItemImportacaoComFalhaInput, MarcarItemImportacaoProcessadoInput,
  RegistrarItemImportacaoInput, SolicitarImportacaoInput } from "./tipos";

/**
 * 
 * @param resultado 
 * @param campo 
 * @param valor 
 * @returns 
 */
function mapearErro(resultado: Result<string | number, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return erroImportacaoInvalida({ campo, valor });
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarSolicitarImportacaoInput(input: SolicitarImportacaoInput): Result<SolicitarImportacaoInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  if (!["ARQUIVO", "PLANILHA", "URL", "SISTEMA_EXTERNO"].includes(input.tipoOrigem)) {
    return erroImportacaoInvalida({
      campo: "tipoOrigem",
      valor: input.tipoOrigem,
    });
  }

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarRegistrarItemImportacaoInput(input: RegistrarItemImportacaoInput): Result<RegistrarItemImportacaoInput, ErroApp> {
  const importacaoId = mapearErro(
    validarIdGenerico(input.importacaoId, "importacaoId"),
    "importacaoId",
    input.importacaoId,
  );
  if (!importacaoId.ok) return importacaoId;

  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  const numeroLinha = mapearErro(
    validarNumeroPositivo(input.numeroLinha, "numeroLinha"),
    "numeroLinha",
    input.numeroLinha,
  );
  if (!numeroLinha.ok) return numeroLinha;

  if (!Number.isInteger(input.numeroLinha)) {
    return erroImportacaoInvalida({
      campo: "numeroLinha",
      valor: input.numeroLinha,
    });
  }

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarListarImportacoesLocatarioInput(input: ListarImportacoesLocatarioInput): Result<ListarImportacoesLocatarioInput, ErroApp> {
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
export function validarListarItensImportacaoInput(input: ListarItensImportacaoInput): Result<ListarItensImportacaoInput, ErroApp> {
  const importacaoId = mapearErro(
    validarIdGenerico(input.importacaoId, "importacaoId"),
    "importacaoId",
    input.importacaoId,
  );
  if (!importacaoId.ok) return importacaoId;

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
export function validarMarcarImportacaoEmExecucaoInput(input: MarcarImportacaoEmExecucaoInput): Result<MarcarImportacaoEmExecucaoInput, ErroApp> {
  const importacaoId = mapearErro(
    validarIdGenerico(input.importacaoId, "importacaoId"),
    "importacaoId",
    input.importacaoId,
  );
  if (!importacaoId.ok) return importacaoId;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarMarcarImportacaoConcluidaInput(input: MarcarImportacaoConcluidaInput): Result<MarcarImportacaoConcluidaInput, ErroApp> {
  const importacaoId = mapearErro(
    validarIdGenerico(input.importacaoId, "importacaoId"),
    "importacaoId",
    input.importacaoId,
  );
  if (!importacaoId.ok) return importacaoId;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarMarcarImportacaoComFalhaInput(input: MarcarImportacaoComFalhaInput): Result<MarcarImportacaoComFalhaInput, ErroApp> {
  const importacaoId = mapearErro(
    validarIdGenerico(input.importacaoId, "importacaoId"),
    "importacaoId",
    input.importacaoId,
  );
  if (!importacaoId.ok) return importacaoId;

  const mensagemErro = mapearErro(
    validarTextoObrigatorio(input.mensagemErro, "mensagemErro", 1),
    "mensagemErro",
    input.mensagemErro,
  );
  if (!mensagemErro.ok) return mensagemErro;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarMarcarItemImportacaoProcessadoInput(input: MarcarItemImportacaoProcessadoInput): Result<MarcarItemImportacaoProcessadoInput, ErroApp> {
  const itemImportacaoId = mapearErro(
    validarIdGenerico(input.itemImportacaoId, "itemImportacaoId"),
    "itemImportacaoId",
    input.itemImportacaoId,
  );
  if (!itemImportacaoId.ok) return itemImportacaoId;

  return wrapOk(input);
}

/**
 * 
 * @param input 
 * @returns 
 */
export function validarMarcarItemImportacaoComFalhaInput(input: MarcarItemImportacaoComFalhaInput): Result<MarcarItemImportacaoComFalhaInput, ErroApp> {
  const itemImportacaoId = mapearErro(
    validarIdGenerico(input.itemImportacaoId, "itemImportacaoId"),
    "itemImportacaoId",
    input.itemImportacaoId,
  );
  if (!itemImportacaoId.ok) return itemImportacaoId;

  const detalheErro = mapearErro(
    validarTextoObrigatorio(input.detalheErro, "detalheErro", 1),
    "detalheErro",
    input.detalheErro,
  );
  if (!detalheErro.ok) return detalheErro;

  return wrapOk(input);
}
