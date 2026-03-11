import { wrapOk } from "../../result";
import type { ResultadoRevogarToken, RevogarTokenInput,} from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarAgora, validarLocatarioId, validarUsuarioId,} from "../validadores";

export function criarRevogarToken(deps: {tokensRepo: TokensRepositorio;}) {
  return async function revogarToken(input: RevogarTokenInput): ResultadoRevogarToken {
    const loc = validarLocatarioId(input.locatarioId);
    if (!loc.ok) return loc;

    const user = validarUsuarioId(input.usuarioId);
    if (!user.ok) return user;

    const agora = validarAgora(input.agora);
    if (!agora.ok) return agora;

    const tokenId =
      typeof input.tokenId === "string" && input.tokenId.trim().length > 0
        ? input.tokenId.trim()
        : null;

    if (!tokenId) {
      return {
        ok: false,
        error: {
          codigo: "INVALIDO",
          mensagem: "tokenId inválido.",
          detalhes: { campo: "tokenId" },
        },
      };
    }

    const res = await deps.tokensRepo.revogar({
      locatarioId: loc.value,
      tokenId,
      revogadoPor: user.value,
      revogadoEm: agora.value,
      motivo: input.motivo,
    });
    if (!res.ok) return res;

    return wrapOk<void>(undefined);
  };
}