// packages/core/src/auth/usecases/logout.ts

import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel/index.js";
import { EventosSegurancaPorta, TokensAuthPorta } from "../portasServico.js";
import { LogoutInput, LogoutOutput, LogoutResult } from "../tipos.js";
import { validarLocatarioIdAuth, validarTokenNaoVazio } from "../validadores.js";

/**
 * 
 * Cria o caso de uso responsável por encerrar a sessão lógica atual
 * a partir do refresh token apresentado pelo cliente.
 *
 * Estratégia atual:
 * - validar a entrada;
 * - localizar/validar o refresh token atual;
 * - revogar o refresh token persistido;
 * - registrar evento de segurança;
 * - devolver sucesso sem payload.
 *
 * @param deps 
 * @returns 
 */
export function createFnLogout(deps: {
  tokensPorta: TokensAuthPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  eventos?: EventosSegurancaPorta;
}) {
/**
 * 
 */
  return async function logout(input: LogoutInput): LogoutResult {
    const locatarioId = validarLocatarioIdAuth(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const refresh = validarTokenNaoVazio(input.refreshToken);
    if (!refresh.ok) return refresh;

    const agora = deps.relogio.agora();

    const refreshValido = await deps.tokensPorta.validarRefresh({
      locatarioId: locatarioId.value,
      tokenBruto: refresh.value,
      agora,
    });
    if (!refreshValido.ok) return refreshValido;

    const revogarRes = await executarEmTransacao(deps.transacao, async () => {
      return deps.tokensPorta.revogar({
        chave: refreshValido.value.chave,
        agora,
      });
    });
    if (!revogarRes.ok) return revogarRes;

    await deps.eventos?.registrarEvento?.({
      tipo: "auth.logout",
      usuarioId: refreshValido.value.chave.usuarioId,
      locatarioId: locatarioId.value,
      detalhes: {
        tokenId: refreshValido.value.chave.tokenId,
      },
      quando: agora,
    });

    return wrapOk<LogoutOutput>({});
  };
}
