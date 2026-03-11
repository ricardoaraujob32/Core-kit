import { wrapOk } from "../../result";
import type { CriarRefreshInput, RefreshCriado, ResultadoCriarRefresh, TokenPersistido,} from "../tipos";
import type { CriptoTokensPorta, IdPorta, TokensRepositorio,} from "../portasRepositorio";
import { validarAgora, validarLocatarioId, validarTtl, validarUsuarioId,} from "../validadores";

export function criarCriarRefreshToken(deps: {tokensRepo: TokensRepositorio; cripto: CriptoTokensPorta; ids: IdPorta;}) {
  return async function criarRefreshToken(
    input: CriarRefreshInput
  ): ResultadoCriarRefresh {
    const loc = validarLocatarioId(input.locatarioId);
    if (!loc.ok) return loc;

    const user = validarUsuarioId(input.usuarioId);
    if (!user.ok) return user;

    const ttl = validarTtl(input.ttlMs);
    if (!ttl.ok) return ttl;

    const agora = validarAgora(input.agora);
    if (!agora.ok) return agora;

    const tokenBrutoRes = await deps.cripto.gerarTokenSeguro();
    if (!tokenBrutoRes.ok) return tokenBrutoRes;

    const hashRes = await deps.cripto.hashToken(tokenBrutoRes.value);
    if (!hashRes.ok) return hashRes;

    const tokenId = deps.ids.gerarId();
    const expiraEm = new Date(agora.value.getTime() + ttl.value);

    const token: TokenPersistido = {
      tokenId,
      locatarioId: loc.value,
      usuarioId: user.value,
      tipo: "REFRESH",
      hashToken: hashRes.value,
      expiraEm,
      revogadoEm: null,
      criadoEm: agora.value,
      proximoTokenId: null,
      proximoUsuarioId: null,
    };

    const inserirRes = await deps.tokensRepo.inserir(token);
    if (!inserirRes.ok) return inserirRes;

    return wrapOk<RefreshCriado>({
      tokenBruto: tokenBrutoRes.value,
      tokenId,
      expiraEm,
    });
  };
}