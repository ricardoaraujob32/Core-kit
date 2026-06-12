// packages/core/src/auth/usecases/validarSessao.ts

import { wrapOk } from "../../kernel";
import { sessaoInvalida } from "../erros";
import { JwtAuthPorta } from "../portasServico";
import { ValidarSessaoResult, SessaoValidada, ValidarSessaoInput, ValidarSessaoOutput } from "../tipos";
import { validarTokenNaoVazio } from "../validadores";

/**
 * Cria o caso de uso responsável por validar um access token
 * e convertê-lo em uma projeção de sessão autenticada.
 *
 * Este caso de uso:
 * - valida que o token textual não esteja vazio;
 * - delega à `jwtPorta` a verificação do token;
 * - converte o payload em `SessaoValidada`;
 * - devolve erro específico de sessão inválida quando a validação falha.
 *
 * Dependências:
 * - `jwtPorta`: serviço de validação do access token.
 *
 * @param deps Dependências externas necessárias para a execução.
 * @returns Função `validarSessao` pronta para receber a entrada do caso de uso.
 */
export function createFnValidarSessao(deps: {jwtPorta: JwtAuthPorta}) {
   /**
   * Executa o caso de uso de validação de sessão.
   *
   * Fluxo:
   * 1. valida o token textual de entrada;
   * 2. verifica o token na `jwtPorta`;
   * 3. converte o payload em `SessaoValidada`;
   * 4. falha com `sessaoInvalida` quando a validação JWT falhar.
   *
   * @param input Access token a ser validado.
   * @returns `Ok(sessaoValidada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return function validarSessao(input: ValidarSessaoInput): ValidarSessaoResult {
    const token = validarTokenNaoVazio(input.accessToken);
    if (!token.ok) return token;

    const payloadRes = deps.jwtPorta.validarAccessToken(token.value);
    if (!payloadRes.ok) return sessaoInvalida();

    const payload = payloadRes.value;

    return wrapOk<ValidarSessaoOutput>({
      sessao: {
        usuarioId: payload.sub,
        locatarioId: payload.loc,
        sessionId: payload.session,
        expiraEm: new Date(payload.exp * 1000),
      },
    });
  };
}
