// packages/core/src/exportacoes/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio, wrapOk } from "../kernel/index.js";
import { erroExportacaoInvalida } from "./erros.js";
import { ListarExportacoesLocatarioInput, MarcarExportacaoComFalhaInput, MarcarExportacaoConcluidaInput,
  MarcarExportacaoEmExecucaoInput, SolicitarExportacaoInput } from "./tipos.js";

/**
 * Converte falhas dos validadores transversais em erro específico
 * do domínio de exportações.
 *
 * @param resultado Resultado do validador compartilhado.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor rejeitado.
 * @returns `Ok` original ou `Err` específico do módulo `exportacoes`.
 */
function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return erroExportacaoInvalida({ campo, valor });
}

/**
 * Valida a entrada de solicitação de exportação.
 *
 * Regras atuais:
 * - `locatarioId` válido;
 * - `formato` deve pertencer ao conjunto aceito pelo módulo.
 *
 * @param input Entrada recebida para criação da exportação.
 * @returns `Ok(input)` quando a estrutura mínima é válida.
 */
export function validarSolicitarExportacaoInput(input: SolicitarExportacaoInput): Result<SolicitarExportacaoInput, ErroApp> {
  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  if (!["CSV", "XLSX", "JSON", "PDF"].includes(input.formato)) {
    return erroExportacaoInvalida({ campo: "formato", valor: input.formato });
  }

  return wrapOk(input);
}

/**
 * Valida a entrada de listagem de exportações de um locatário.
 *
 * @param input Filtro recebido para a operação.
 * @returns `Ok(input)` quando o locatário é válido.
 */
export function validarListarExportacoesLocatarioInput(input: ListarExportacoesLocatarioInput): Result<ListarExportacoesLocatarioInput, ErroApp> {
  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  return wrapOk(input);
}

/**
 * Valida a entrada usada para marcar uma exportação como em execução.
 *
 * @param input Entrada recebida para mudança de status.
 * @returns `Ok(input)` quando o identificador é válido.
 */
export function validarMarcarExportacaoEmExecucaoInput(input: MarcarExportacaoEmExecucaoInput): Result<MarcarExportacaoEmExecucaoInput, ErroApp> {
  const exportacaoId = mapearErro( validarIdGenerico(input.exportacaoId, "exportacaoId"), "exportacaoId", input.exportacaoId );
  if (!exportacaoId.ok) return exportacaoId;

  return wrapOk(input);
}

/**
 * Valida a entrada usada para marcar uma exportação como concluída.
 *
 * Regras atuais:
 * - `exportacaoId` válido;
 * - `referenciaResultado` obrigatória.
 *
 * @param input Entrada recebida para mudança de status.
 * @returns `Ok(input)` quando os campos obrigatórios são válidos.
 */
export function validarMarcarExportacaoConcluidaInput(input: MarcarExportacaoConcluidaInput): Result<MarcarExportacaoConcluidaInput, ErroApp> {
  const exportacaoId = mapearErro( validarIdGenerico(input.exportacaoId, "exportacaoId"), "exportacaoId", input.exportacaoId );
  if (!exportacaoId.ok) return exportacaoId;

  const referenciaResultado = mapearErro( validarTextoObrigatorio(input.referenciaResultado, "referenciaResultado", 1), 
    "referenciaResultado", input.referenciaResultado );
  if (!referenciaResultado.ok) return referenciaResultado;

  return wrapOk(input);
}

/**
 * Valida a entrada usada para marcar uma exportação com falha.
 *
 * Regras atuais:
 * - `exportacaoId` válido;
 * - `mensagemErro` obrigatória.
 *
 * @param input Entrada recebida para mudança de status com falha.
 * @returns `Ok(input)` quando os campos obrigatórios são válidos.
 */
export function validarMarcarExportacaoComFalhaInput(input: MarcarExportacaoComFalhaInput): Result<MarcarExportacaoComFalhaInput, ErroApp> {
  const exportacaoId = mapearErro( validarIdGenerico(input.exportacaoId, "exportacaoId"), "exportacaoId", input.exportacaoId );
  if (!exportacaoId.ok) return exportacaoId;

  const mensagemErro = mapearErro( validarTextoObrigatorio(input.mensagemErro, "mensagemErro", 1), "mensagemErro", input.mensagemErro );
  if (!mensagemErro.ok) return mensagemErro;

  return wrapOk(input);
}
