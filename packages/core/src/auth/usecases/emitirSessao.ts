// packages/core/src/auth/usecases/emitirSessao.ts

import { IdPorta, RelogioPorta, wrapOk } from "../../kernel";
import { credenciaisInvalidas, locatarioNaoPodeAutenticar, usuarioNaoPodeAutenticar } from "../erros";
import { EventosSegurancaPorta } from "../portasRepositorio";
import { HashAuthPorta, JwtAuthPorta, LocatariosAuthPorta, TokensAuthPorta, UsuariosAuthPorta } from "../portasServico";
import { EmitirSessaoInput, ResultadoEmitirSessao, Sessao } from "../tipos";
import { validarEmailAuth, validarLocatarioIdAuth, validarSenha } from "../validadores";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnEmitirSessao(deps: {
  usuariosPorta: UsuariosAuthPorta;
  locatariosPorta?: LocatariosAuthPorta;
  tokensPorta: TokensAuthPorta;
  hashPorta: HashAuthPorta;
  jwtPorta: JwtAuthPorta;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  eventos?: EventosSegurancaPorta;
  ttlAccessSegundos?: number;
  ttlRefreshMs?: number;
  issuer?: string;
}) {
  return async function emitirSessao(input: EmitirSessaoInput): ResultadoEmitirSessao {
    const locatarioId = validarLocatarioIdAuth(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const email = validarEmailAuth(input.email);
    if (!email.ok) return email;

    const senha = validarSenha(input.senha);
    if (!senha.ok) return senha;

    const agora = deps.relogio.agora();

    if (deps.locatariosPorta) {
      const locRes = await deps.locatariosPorta.buscarPorId({
        locatarioId: locatarioId.value,
      });
      if (!locRes.ok) return locRes;

      const locatario = locRes.value;
      if (!locatario) return credenciaisInvalidas();
      if (locatario.status !== "ATIVO") {
        return locatarioNaoPodeAutenticar(locatario.status);
      }
    }

    const usuarioRes = await deps.usuariosPorta.buscarPorEmail({
      locatarioId: locatarioId.value,
      email: email.value,
    });
    if (!usuarioRes.ok) return usuarioRes;

    const usuario = usuarioRes.value;
    if (!usuario) {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: null,
        locatarioId: locatarioId.value,
        detalhes: { motivo: "usuario_nao_encontrado", email: email.value },
        quando: agora,
      });
      return credenciaisInvalidas();
    }

    if (usuario.status !== "ATIVO") {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: usuario.usuarioId,
        locatarioId: locatarioId.value,
        detalhes: { motivo: "status_invalido", status: usuario.status },
        quando: agora,
      });
      return usuarioNaoPodeAutenticar(usuario.status);
    }

    const senhaOk = await deps.hashPorta.compararSenha(
      senha.value,
      usuario.senhaHash,
    );
    if (!senhaOk.ok) return senhaOk;

    if (!senhaOk.value) {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: usuario.usuarioId,
        locatarioId: locatarioId.value,
        detalhes: { motivo: "senha_incorreta" },
        quando: agora,
      });
      return credenciaisInvalidas();
    }

    const sessionId = deps.idPorta.gerarId();

    const accessRes = await deps.jwtPorta.emitirAccessToken({
      usuarioId: usuario.usuarioId,
      locatarioId: locatarioId.value,
      sessionId,
      agora,
      ttlSegundos: deps.ttlAccessSegundos ?? 600,
      issuer: deps.issuer ?? "mini-saas-auth",
    });
    if (!accessRes.ok) return accessRes;

    const refreshRes = await deps.tokensPorta.criarRefresh({
      locatarioId: locatarioId.value,
      usuarioId: usuario.usuarioId,
      agora,
      ttlMs: deps.ttlRefreshMs ?? 1000 * 60 * 60 * 24 * 14,
    });
    if (!refreshRes.ok) return refreshRes;

    const ultimoLogin = await deps.usuariosPorta.atualizarUltimoLogin({
      usuarioId: usuario.usuarioId,
      quando: agora,
    });
    if (!ultimoLogin.ok) {
      // best effort
    }

    await deps.eventos?.registrarEvento?.({
      tipo: "auth.login.sucesso",
      usuarioId: usuario.usuarioId,
      locatarioId: locatarioId.value,
      detalhes: { sessionId },
      quando: agora,
    });

    const sessao: Sessao = {
      accessToken: accessRes.value.token,
      refreshToken: refreshRes.value.tokenBruto,
      accessExpiraEm: new Date(accessRes.value.payload.exp * 1000),
      refreshExpiraEm: refreshRes.value.expiraEm,
    };

    return wrapOk(sessao);
  };
}