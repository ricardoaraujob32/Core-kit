// packages/core/src/tokens/validadores.ts

import { ErroApp, Result, validarData, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
import { entradaInvalida, tokenInvalido } from "./erros";
import { TokenId, TokenTipo } from "./tipos";

/**
 * Converte falhas de validação ligadas à entidade persistida de token
 * em erro específico do domínio de tokens.
 *
 * @param resultado Resultado da validação transversal.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor rejeitado.
 * @returns `Ok` original ou `Err` específico de token inválido.
 */
function mapearErroToken(resultado: Result<string | Date, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return tokenInvalido({ campo, valor });
}

/**
 * Converte falhas de validação de entrada operacional em erro específico
 * para comandos do módulo de tokens.
 *
 * @param resultado Resultado da validação transversal.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor rejeitado.
 * @returns `Ok` original ou `Err` específico de entrada inválida.
 */
function mapearErroEntrada(resultado: Result<string | Date | number, ErroApp>, campo: string, valor?: unknown): any {
  if (resultado.ok) return resultado;
  return entradaInvalida({ campo, valor });
}

/**
 * Valida o identificador de token persistido.
 *
 * @param tokenId Identificador recebido.
 * @returns `Ok(tokenId)` quando o valor atende ao contrato mínimo.
 */
export function validarTokenId(tokenId: TokenId): Result<string, ErroApp> {
  return mapearErroToken(
    validarIdGenerico(tokenId, "tokenId"),
    "tokenId",
    tokenId,
  );
}

/**
 * Valida o valor bruto de um token recebido na borda.
 *
 * @param tokenBruto Token textual informado.
 * @returns `Ok(tokenBruto)` quando o valor não é vazio.
 */
export function validarTokenBruto(tokenBruto: string): Result<string, ErroApp> {
  return mapearErroEntrada(
    validarTextoObrigatorio(tokenBruto, "tokenBruto", 1),
    "tokenBruto",
    tokenBruto,
  );
}

/**
 * Valida um TTL em milissegundos.
 *
 * Regras atuais:
 * - número finito;
 * - estritamente positivo.
 *
 * @param ttlMs TTL recebido.
 * @returns `Ok(ttlMs)` quando o valor é válido.
 */
export function validarTtl(ttlMs: number): Result<number, ErroApp> {
  const res = validarNumeroPositivo(ttlMs, "ttlMs");
  if (res.ok) return res;
  return entradaInvalida({ campo: "ttlMs", valor: ttlMs });
}

/**
 * Valida o instante materializado usado pela operação.
 *
 * @param agora Data/hora recebida.
 * @returns `Ok(agora)` quando a data é válida.
 */
export function validarAgora(agora: Date): Result<Date, ErroApp> {
  const res = validarData(agora, "agora");
  if (res.ok) return res;
  return entradaInvalida({ campo: "agora" });
}

/**
 * Valida o hash persistido de um token.
 *
 * A regra atual exige ao menos 16 caracteres como proteção mínima
 * contra valores vazios ou manifestamente inválidos.
 *
 * @param hashToken Hash do token.
 * @returns `Ok(hashToken)` quando o valor atende ao mínimo esperado.
 */
export function validarHashToken(hashToken: string): Result<string, ErroApp> {
  return mapearErroToken(
    validarTextoObrigatorio(hashToken, "hashToken", 16),
    "hashToken",
    hashToken,
  );
}

/**
 * Valida o tipo de token segundo o catálogo aceito pelo módulo.
 *
 * @param tipo Tipo recebido para validação.
 * @returns `Ok(tipo)` quando o tipo pertence ao conjunto permitido.
 */
export function validarTokenTipo(tipo: TokenTipo): Result<TokenTipo, ErroApp> {
  if (!["ACESSO","REFRESH","RECUPERACAO_SENHA","CONFIRMACAO_EMAIL",].includes(tipo)) {
    return tokenInvalido({ campo: "tipo" });
  }

  return wrapOk(tipo);
}

/**
 * Valida a data de expiração de um token.
 *
 * @param expiraEm Data de expiração recebida.
 * @returns `Ok(expiraEm)` quando a data é válida.
 */
export function validarExpiraEm(expiraEm: Date): Result<Date, ErroApp> {
  const res = validarData(expiraEm, "expiraEm");
  if (res.ok) return res;
  return tokenInvalido({ campo: "expiraEm" });
}
