import { wrapOk } from "../../result";
import type { RefreshValido, ResultadoValidarRefresh, ValidarRefreshInput,} from "../tipos";
import type { CriptoTokensPorta, TokensRepositorio,} from "../portasRepositorio";
import { validarAgora, validarLocatarioId, validarTokenBruto,} from "../validadores";
import { tokenNaoAutenticado, conflitoRotacao } from "../erros";

export function criarValidarRefreshToken(deps: {
  tokensRepo: TokensRepositorio;
  cripto: CriptoTokensPorta;
  detectarReplayRotacao?: boolean;
}) {
  return async function validarRefreshToken(input: ValidarRefreshInput): ResultadoValidarRefresh {
    const loc = validarLocatarioId(input.locatarioId);
    if (!loc.ok) return loc;

    const tokenBruto = validarTokenBruto(input.tokenBruto);
    if (!tokenBruto.ok) return tokenBruto;

    const agora = validarAgora(input.agora);
    if (!agora.ok) return agora;

    const hashRes = await deps.cripto.hashToken(tokenBruto.value);
    if (!hashRes.ok) return hashRes;

    const tokenRes = await deps.tokensRepo.buscarPorHash({
      locatarioId: loc.value,
      hashToken: hashRes.value,
    });
    if (!tokenRes.ok) return tokenRes;

    const token = tokenRes.value;
    if (!token) return tokenNaoAutenticado();

    if (token.revogadoEm) return tokenNaoAutenticado();

    if (agora.value.getTime() >= token.expiraEm.getTime()) {
      return tokenNaoAutenticado();
    }

    if (
      deps.detectarReplayRotacao &&
      token.proximoTokenId &&
      token.proximoUsuarioId
    ) {
      return conflitoRotacao({
        tokenId: token.tokenId,
        proximoTokenId: token.proximoTokenId,
      });
    }

    return wrapOk<RefreshValido>({
      tokenId: token.tokenId,
      usuarioId: token.usuarioId,
      expiraEm: token.expiraEm,
    });
  };
}