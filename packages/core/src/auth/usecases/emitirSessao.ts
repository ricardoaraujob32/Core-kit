import { wrapOk } from "../../result";
import type { EmitirSessaoInput, ResultadoSessao, Sessao } from "../tipos";
import type {
  CriptoAuthPorta,
  EventosSegurancaPorta,
  IdPorta,
  JwtPorta,
  LocatariosRepositorioAuth,
  RelogioPorta,
  TokensServicePorta,
  UsuariosRepositorioAuth,
} from "../portasRepositorio";
import {
  validarEmail,
  validarLocatarioId,
  validarSenha,
} from "../validadores";
import {
  credenciaisInvalidas,
  usuarioNaoPodeAutenticar,
} from "../erros";

export function criarEmitirSessao(deps: {
  usuariosRepo: UsuariosRepositorioAuth;
  locatariosRepo?: LocatariosRepositorioAuth;
  tokens: TokensServicePorta;
  cripto: CriptoAuthPorta;
  jwt: JwtPorta;
  relogio: RelogioPorta;
  ids: IdPorta;
  eventos?: EventosSegurancaPorta;
  ttlAccessSegundos?: number;
  ttlRefreshMs?: number;
  issuer?: string;
}) {
  return async function emitirSessao(
    input: EmitirSessaoInput
  ): ResultadoSessao {
    const loc = validarLocatarioId(input.locatarioId);
    if (!loc.ok) return Promise.resolve(loc);

    const email = validarEmail(input.email);
    if (!email.ok) return Promise.resolve(email);

    const senha = validarSenha(input.senha);
    if (!senha.ok) return Promise.resolve(senha);

    const agora = deps.relogio.agora();

    if (deps.locatariosRepo) {
      const locRes = await deps.locatariosRepo.buscarPorId({
        locatarioId: input.locatarioId,
      });
      if (!locRes.ok) return locRes;

      const locatario = locRes.value;
      if (!locatario) return credenciaisInvalidas();
      if (locatario.status !== "ATIVO") {
        return {
          ok: false,
          error: {
            codigo: "CONFLITO",
            mensagem: "Locatário indisponível para autenticação.",
            detalhes: { locatarioId: input.locatarioId, status: locatario.status },
          },
        };
      }
    }

    const usuarioRes = await deps.usuariosRepo.buscarPorEmail({
      locatarioId: input.locatarioId,
      email: input.email,
    });
    if (!usuarioRes.ok) return usuarioRes;

    const usuario = usuarioRes.value;
    if (!usuario) {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: null,
        locatarioId: input.locatarioId,
        detalhes: { motivo: "usuario_nao_encontrado", email: input.email },
        quando: agora,
      });
      return credenciaisInvalidas();
    }

    if (usuario.status !== "ATIVO") {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: usuario.usuarioId,
        locatarioId: input.locatarioId,
        detalhes: { motivo: "status_invalido", status: usuario.status },
        quando: agora,
      });
      return usuarioNaoPodeAutenticar(usuario.status);
    }

    const senhaOkRes = await deps.cripto.compararSenha(
      input.senha,
      usuario.senhaHash
    );
    if (!senhaOkRes.ok) return senhaOkRes;

    if (!senhaOkRes.value) {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: usuario.usuarioId,
        locatarioId: input.locatarioId,
        detalhes: { motivo: "senha_incorreta" },
        quando: agora,
      });
      return credenciaisInvalidas();
    }

    const sessionId = deps.ids.gerarId();

    const accessRes = await deps.jwt.emitirAccessToken({
      usuarioId: usuario.usuarioId,
      locatarioId: input.locatarioId,
      sessionId,
      agora,
      ttlSegundos: deps.ttlAccessSegundos ?? 600,
      issuer: deps.issuer ?? "mini-saas-auth",
    });
    if (!accessRes.ok) return accessRes;

    const refreshRes = await deps.tokens.criarRefresh({
      locatarioId: input.locatarioId,
      usuarioId: usuario.usuarioId,
      agora,
      ttlMs: deps.ttlRefreshMs ?? 1000 * 60 * 60 * 24 * 14,
    });
    if (!refreshRes.ok) return refreshRes;

    const ultimoLoginRes = await deps.usuariosRepo.atualizarUltimoLogin({
      locatarioId: input.locatarioId,
      usuarioId: usuario.usuarioId,
      quando: agora,
    });

    if (!ultimoLoginRes.ok) {
      // best-effort: não bloqueia login
    }

    await deps.eventos?.registrarEvento?.({
      tipo: "auth.login.sucesso",
      usuarioId: usuario.usuarioId,
      locatarioId: input.locatarioId,
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