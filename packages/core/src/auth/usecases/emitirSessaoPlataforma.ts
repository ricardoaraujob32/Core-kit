// packages/core/src/auth/usecases/emitirSessaoPlataforma.ts

import type { IdPorta, RelogioPorta, TransacaoPorta } from "../../kernel/index.js";
import { createErroApp, executarEmTransacao, wrapOk } from "../../kernel/index.js";
import type {
  EventosSegurancaPorta,
  HashAuthPorta,
  JwtAuthPorta,
  TokensAuthPorta,
} from "../portasServico.js";
import type { UsuariosRepositorioAuth } from "../portasRepositorio.js";
import {
  EmitirSessaoPlataformaInput,
  EmitirSessaoPlataformaOutput,
  EmitirSessaoPlataformaResult,
} from "../tipos.js";

export function createFnEmitirSessaoPlataforma(deps: {
  usuariosRepositorio: UsuariosRepositorioAuth;
  tokensPorta: TokensAuthPorta;
  hashPorta: HashAuthPorta;
  jwtPorta: JwtAuthPorta;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  transacao?: TransacaoPorta;
  issuer: string;
  eventos?: EventosSegurancaPorta;
  ttlAccessSegundos?: number;
  ttlRefreshMs?: number;
}) {
  return async function emitirSessaoPlataforma(
    input: EmitirSessaoPlataformaInput,
  ): EmitirSessaoPlataformaResult {
    const email = input.email?.trim().toLowerCase();
    const agora = deps.relogio.agora();

    if (!email || !input.senha) {
      return createErroApp({
        codigo: "INVALIDO",
        mensagem: "E-mail e senha são obrigatórios.",
        detalhes: {
          operacao: "auth.plataforma.emitirSessao.validarEntrada",
        },
      });
    }

    const usuarioResult =
      await deps.usuariosRepositorio.buscarUsuarioPlataformaPorEmail({
        email,
      });

    if (!usuarioResult.ok) return usuarioResult;

    const usuario = usuarioResult.value;

    if (!usuario) {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: null,
        locatarioId: null,
        quando: agora,
        detalhes: {
          perfil: "PLATAFORMA",
          motivo: "usuario_plataforma_nao_encontrado",
          email,
        },
      });

      return createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Credenciais inválidas.",
        detalhes: {
          operacao: "auth.plataforma.emitirSessao.credenciais",
        },
      });
    }

    if (usuario.locatarioId !== null) {
      return createErroApp({
        codigo: "NAO_AUTORIZADO",
        mensagem: "Usuário informado não é usuário de plataforma.",
        detalhes: {
          operacao: "auth.plataforma.emitirSessao.usuarioNaoPlataforma",
          usuarioId: usuario.usuarioId,
        },
      });
    }

    if (usuario.status !== "ATIVO") {
      return createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Usuário de plataforma não está ativo.",
        detalhes: {
          operacao: "auth.plataforma.emitirSessao.status",
          usuarioId: usuario.usuarioId,
          status: usuario.status,
        },
      });
    }

    const senhaOk = await deps.hashPorta.compararSenha(
      input.senha,
      usuario.senhaHash,
    );

    if (!senhaOk.ok) return senhaOk;

    if (!senhaOk.value) {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: usuario.usuarioId,
        locatarioId: null,
        quando: agora,
        detalhes: {
          perfil: "PLATAFORMA",
          motivo: "senha_invalida",
        },
      });

      return createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Credenciais inválidas.",
        detalhes: {
          operacao: "auth.plataforma.emitirSessao.credenciais",
        },
      });
    }

    const sessionId = deps.idPorta.gerarId();
    const ttlSegundos = deps.ttlAccessSegundos ?? 5 * 60;

    const accessTokenResult = await deps.jwtPorta.emitirAccessToken({
      usuarioId: usuario.usuarioId,
      locatarioId: null,
      sessionId,
      agora,
      ttlSegundos,
      issuer: deps.issuer,
    });

    if (!accessTokenResult.ok) return accessTokenResult;

    const refreshResult = await executarEmTransacao(deps.transacao, async () => {
      return deps.tokensPorta.criarRefresh({
        locatarioId: null,
        usuarioId: usuario.usuarioId,
        agora,
        ttlMs: deps.ttlRefreshMs ?? 1000 * 60 * 60,
      });
    });

    if (!refreshResult.ok) return refreshResult;

    await deps.eventos?.registrarEvento?.({
      tipo: "auth.login.sucesso",
      usuarioId: usuario.usuarioId,
      locatarioId: null,
      quando: agora,
      detalhes: {
        perfil: "PLATAFORMA",
        sessionId,
      },
    });

    return wrapOk<EmitirSessaoPlataformaOutput>({
      accessToken: accessTokenResult.value.token,
      refreshToken: refreshResult.value.tokenBruto,
      accessExpiraEm: new Date(accessTokenResult.value.payload.exp * 1000),
      refreshExpiraEm: refreshResult.value.expiraEm,
      usuarioId: usuario.usuarioId,
    });
  };
}
