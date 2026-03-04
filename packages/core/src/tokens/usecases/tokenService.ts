import { wrapOk, wrapErr } from "../../result";

export function criarTokensService(deps: any) {
  const {
    tokenRepo,
    jwt,
    crypto,
    agora,
    ttlMinutos,
    ttlDias,
  } = deps;

  async function emitirSessao({
    locatarioId,
    usuarioId,
  }: any) {
    const accessToken = jwt.emitirAccessToken(
      { usuarioId, locatarioId },
      ttlMinutos.acesso * 60,
    );

    const refreshToken = crypto.gerarTokenBruto();
    const hash = crypto.hash(refreshToken);
    const tokenId = crypto.gerarId();

    await tokenRepo.inserir({
      token_id: tokenId,
      usuario_id: usuarioId,
      locatario_id: locatarioId,
      tipo: "REFRESH",
      hash_token: hash,
      emitido_em: agora(),
      expira_em: new Date(
        agora().getTime() + ttlDias.refresh * 86400000,
      ),
      revogado_em: null,
      proximo_token_id: null,
      proximo_usuario_id: null,
    });

    return wrapOk({ accessToken, refreshToken });
  }

  async function renovarSessao({ refreshToken }: any) {
    const hash = crypto.hash(refreshToken);
    const r = await tokenRepo.buscarPorHash(hash);

    if (!r.ok || !r.value) {
      return wrapErr({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Refresh inválido.",
      });
    }

    const row = r.value;

    if (row.revogado_em || row.proximo_token_id) {
      return wrapErr({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Replay detectado.",
      });
    }

    const novoRefresh = crypto.gerarTokenBruto();
    const novoHash = crypto.hash(novoRefresh);
    const novoId = crypto.gerarId();

    await tokenRepo.inserir({
      ...row,
      token_id: novoId,
      hash_token: novoHash,
      emitido_em: agora(),
      expira_em: new Date(
        agora().getTime() + ttlDias.refresh * 86400000,
      ),
      revogado_em: null,
      proximo_token_id: null,
      proximo_usuario_id: null,
    });

    await tokenRepo.setProximo({
      tokenId: row.token_id,
      usuarioId: row.usuario_id,
      proximoTokenId: novoId,
      proximoUsuarioId: row.usuario_id,
    });

    return wrapOk({
      accessToken: jwt.emitirAccessToken(
        {
          usuarioId: row.usuario_id,
          locatarioId: row.locatario_id,
        },
        ttlMinutos.acesso * 60,
      ),
      refreshToken: novoRefresh,
    });
  }

  return {
    emitirSessao,
    renovarSessao,
  };
}