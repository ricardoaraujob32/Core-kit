// packages/core/src/importacoes/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
import { erroImportacaoInvalida } from "./erros";
import { ListarImportacoesLocatarioInput, ListarItensImportacaoInput, MarcarImportacaoComFalhaInput, MarcarImportacaoConcluidaInput,
  MarcarImportacaoEmExecucaoInput, MarcarItemImportacaoComFalhaInput, MarcarItemImportacaoProcessadoInput,
  RegistrarItemImportacaoInput, SolicitarImportacaoInput } from "./tipos";

/**
 * Converte falhas dos validadores transversais em erro específico
 * do domínio de importações.
 *
 * @param resultado Resultado da validação compartilhada.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor rejeitado.
 * @returns `Ok` original ou `Err` específico do módulo `importacoes`.
 */
function mapearErro(resultado: Result<string | number, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return erroImportacaoInvalida({ campo, valor });
}

/**
 * Valida a entrada de solicitação de importação.
 *
 * Regras atuais:
 * - `locatarioId` obrigatório e válido;
 * - `tipoOrigem` deve pertencer ao conjunto aceito pelo módulo.
 *
 * @param input Entrada recebida para criação de importação.
 * @returns `Ok(input)` quando a estrutura mínima é válida.
 */
export function validarSolicitarImportacaoInput(input: SolicitarImportacaoInput): Result<SolicitarImportacaoInput, ErroApp> {
  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
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
 * Valida a entrada de registro de item de importação.
 *
 * Regras atuais:
 * - `importacaoId` válido;
 * - `locatarioId` válido;
 * - `numeroLinha` positivo e inteiro.
 *
 * @param input Entrada do item a registrar.
 * @returns `Ok(input)` quando os campos obrigatórios são válidos.
 */
export function validarRegistrarItemImportacaoInput(input: RegistrarItemImportacaoInput): Result<RegistrarItemImportacaoInput, ErroApp> {
  const importacaoId = mapearErro( validarIdGenerico(input.importacaoId, "importacaoId"), "importacaoId", input.importacaoId );
  if (!importacaoId.ok) return importacaoId;

  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  const numeroLinha = mapearErro( validarNumeroPositivo(input.numeroLinha, "numeroLinha"), "numeroLinha", input.numeroLinha );
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
 * Valida a entrada de listagem de importações de um locatário.
 *
 * @param input Filtro recebido para a operação.
 * @returns `Ok(input)` quando o locatário é válido.
 */
export function validarListarImportacoesLocatarioInput(input: ListarImportacoesLocatarioInput): Result<ListarImportacoesLocatarioInput, ErroApp> {
  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  return wrapOk(input);
}

/**
 * Valida a entrada de listagem de itens de uma importação.
 *
 * @param input Filtro recebido para a operação.
 * @returns `Ok(input)` quando `importacaoId` e `locatarioId` são válidos.
 */
export function validarListarItensImportacaoInput(input: ListarItensImportacaoInput): Result<ListarItensImportacaoInput, ErroApp> {
  const importacaoId = mapearErro( validarIdGenerico(input.importacaoId, "importacaoId"), "importacaoId", input.importacaoId );
  if (!importacaoId.ok) return importacaoId;

  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  return wrapOk(input);
}

/**
 * Valida a entrada usada para marcar uma importação como em execução.
 *
 * @param input Entrada recebida para mudança de status.
 * @returns `Ok(input)` quando o identificador é válido.
 */
export function validarMarcarImportacaoEmExecucaoInput(input: MarcarImportacaoEmExecucaoInput): Result<MarcarImportacaoEmExecucaoInput, ErroApp> {
  const importacaoId = mapearErro( validarIdGenerico(input.importacaoId, "importacaoId"), "importacaoId", input.importacaoId );
  if (!importacaoId.ok) return importacaoId;

  return wrapOk(input);
}

/**
 * Valida a entrada usada para marcar uma importação como concluída.
 *
 * @param input Entrada recebida para mudança de status.
 * @returns `Ok(input)` quando o identificador é válido.
 */
export function validarMarcarImportacaoConcluidaInput(input: MarcarImportacaoConcluidaInput): Result<MarcarImportacaoConcluidaInput, ErroApp> {
  const importacaoId = mapearErro( validarIdGenerico(input.importacaoId, "importacaoId"), "importacaoId", input.importacaoId );
  if (!importacaoId.ok) return importacaoId;

  return wrapOk(input);
}

/**
 * Valida a entrada usada para marcar uma importação com falha.
 *
 * Regras atuais:
 * - `importacaoId` válido;
 * - `mensagemErro` obrigatória.
 *
 * @param input Entrada recebida para mudança de status com falha.
 * @returns `Ok(input)` quando os campos obrigatórios são válidos.
 */
export function validarMarcarImportacaoComFalhaInput(input: MarcarImportacaoComFalhaInput): Result<MarcarImportacaoComFalhaInput, ErroApp> {
  const importacaoId = mapearErro( validarIdGenerico(input.importacaoId, "importacaoId"), "importacaoId", input.importacaoId );
  if (!importacaoId.ok) return importacaoId;

  const mensagemErro = mapearErro( validarTextoObrigatorio(input.mensagemErro, "mensagemErro", 1), "mensagemErro", input.mensagemErro );
  if (!mensagemErro.ok) return mensagemErro;

  return wrapOk(input);
}

/**
 * Valida a entrada usada para marcar um item de importação como processado.
 *
 * @param input Entrada recebida para atualização do item.
 * @returns `Ok(input)` quando o identificador do item é válido.
 */
export function validarMarcarItemImportacaoProcessadoInput(input: MarcarItemImportacaoProcessadoInput): Result<MarcarItemImportacaoProcessadoInput, ErroApp> {
  const itemImportacaoId = mapearErro( validarIdGenerico(input.itemImportacaoId, "itemImportacaoId"), "itemImportacaoId", input.itemImportacaoId );
  if (!itemImportacaoId.ok) return itemImportacaoId;

  return wrapOk(input);
}

/**
 * Valida a entrada usada para marcar um item de importação com falha.
 *
 * Regras atuais:
 * - `itemImportacaoId` válido;
 * - `detalheErro` obrigatório.
 *
 * @param input Entrada recebida para atualização do item.
 * @returns `Ok(input)` quando os campos obrigatórios são válidos.
 */
export function validarMarcarItemImportacaoComFalhaInput(input: MarcarItemImportacaoComFalhaInput): Result<MarcarItemImportacaoComFalhaInput, ErroApp> {
  const itemImportacaoId = mapearErro( validarIdGenerico(input.itemImportacaoId, "itemImportacaoId"), "itemImportacaoId", input.itemImportacaoId );
  if (!itemImportacaoId.ok) return itemImportacaoId;

  const detalheErro = mapearErro( validarTextoObrigatorio(input.detalheErro, "detalheErro", 1), "detalheErro", input.detalheErro );
  if (!detalheErro.ok) return detalheErro;

  return wrapOk(input);
}
