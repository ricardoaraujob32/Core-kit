// packages/core/src/auth/usecases/logout.ts

import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
import { EventosSegurancaPorta, TokensAuthPorta } from "../portasServico";
import { LogoutInput, LogoutOutput, LogoutResult } from "../tipos";
import { validarLocatarioIdAuth, validarTokenNaoVazio } from "../validadores";

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
        tokenId: refreshValido.value.tokenId,
        agora,
      });
    });
    if (!revogarRes.ok) return revogarRes;

    await deps.eventos?.registrarEvento?.({
      tipo: "auth.logout",
      usuarioId: refreshValido.value.usuarioId,
      locatarioId: locatarioId.value,
      detalhes: {
        tokenId: refreshValido.value.tokenId,
      },
      quando: agora,
    });

    return wrapOk<LogoutOutput>({});
  };
}
