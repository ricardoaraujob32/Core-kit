// packages/core/src/auth/usecases/logoutPlataforma.ts

import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel/index.js";
import { EventosSegurancaPorta, TokensAuthPorta } from "../portasServico.js";
import { LogoutPlataformaInput, LogoutPlataformaOutput, LogoutPlataformaResult } from "../tipos.js";
import { validarTokenNaoVazio } from "../validadores.js";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnLogoutPlataforma(deps: {
  tokensPorta: TokensAuthPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  eventos?: EventosSegurancaPorta;
}) {
  /**
   * 
   */
  return async function logoutPlataforma(input: LogoutPlataformaInput): LogoutPlataformaResult {
    const refresh = validarTokenNaoVazio(input.refreshToken);
    if (!refresh.ok) return refresh;

    const agora = deps.relogio.agora();

    const refreshValido = await deps.tokensPorta.validarRefresh({
      locatarioId: null,
      tokenBruto: refresh.value,
      agora,
    });
    if (!refreshValido.ok) return refreshValido;

    if (refreshValido.value.chave.locatarioId !== null) {
      return {
        ok: false,
        error: {
          codigo: "NAO_AUTENTICADO",
          mensagem: "Refresh token inválido para plataforma.",
          detalhes: {
            operacao: "auth.plataforma.logout.escopo",
          },
        },
      };
    }

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
      locatarioId: null,
      detalhes: {
        tokenId: refreshValido.value.chave.tokenId,
        escopo: "PLATAFORMA",
      },
      quando: agora,
    });

    return wrapOk<LogoutPlataformaOutput>({});
  };
}