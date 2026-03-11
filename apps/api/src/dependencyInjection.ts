import {
  criarCriarLocatario,
  criarListarLocatarios,
  criarObterLocatario,
  criarCriarUsuario,
  criarListarUsuarios,
  criarObterUsuario,
  criarEmitirSessao,
  criarValidarSessao,
  criarResolverContextoAutorizado,
  criarRotacionarRefresh,
  resolverPermissoes,
} from "@core-kit/core";

import { criarLocatariosRepositorioMemoria } from "@core-kit/core";
import { criarUsuariosRepositorioMemoria } from "@core-kit/core";
import { criarRbacRepositorioMemoria } from "@core-kit/core";
import { criarTokensRepositorioMemoria } from "@core-kit/core";

export function criarDependenciasAplicacao() {
  const locatariosRepo = criarLocatariosRepositorioMemoria();
  const usuariosRepo = criarUsuariosRepositorioMemoria();
  const rbacRepo = criarRbacRepositorioMemoria();
  const tokensRepo = criarTokensRepositorioMemoria();

  const relogio = {
    agora: () => new Date(),
  };

  const ids = {
    gerarId: () => crypto.randomUUID(),
  };

  const criptoAuth = {
    async compararSenha(senha: string, senhaHash: string) {
      return {
        ok: true as const,
        value: senha === senhaHash,
      };
    },
  };

  const jwt = {
    async emitirAccessToken(params: {
      usuarioId: string;
      locatarioId: string;
      sessionId: string;
      agora: Date;
      ttlSegundos: number;
      issuer: string;
    }) {
      const payload = {
        sub: params.usuarioId,
        loc: params.locatarioId,
        session: params.sessionId,
        iat: Math.floor(params.agora.getTime() / 1000),
        exp: Math.floor(params.agora.getTime() / 1000) + params.ttlSegundos,
        iss: params.issuer,
      };

      return {
        ok: true as const,
        value: {
          token: Buffer.from(JSON.stringify(payload)).toString("base64url"),
          expiraEm: new Date(payload.exp * 1000),
        },
      };
    },

    validarAccessToken: async (token: string) => {
      try {
        const payload = JSON.parse(
          Buffer.from(token, "base64url").toString("utf8")
        );

        return {
          ok: true as const,
          value: {
            usuarioId: payload.sub,
            locatarioId: payload.loc,
            expiraEm: new Date(payload.exp * 1000),
          },
        };
      } catch {
        return {
          ok: false as const,
          error: {
            codigo: "NAO_AUTENTICADO" as const,
            mensagem: "Token inválido.",
          },
        };
      }
    },
  };

  const tokensService = {
    async criarRefresh(params: {
      locatarioId: string;
      usuarioId: string;
      agora: Date;
      ttlMs: number;
    }) {
      const tokenId = crypto.randomUUID();
      const tokenBruto = crypto.randomUUID();
      const hashToken = `hash:${tokenBruto}`;
      const expiraEm = new Date(params.agora.getTime() + params.ttlMs);

      const inserirRes = await tokensRepo.inserir({
        tokenId,
        locatarioId: params.locatarioId,
        usuarioId: params.usuarioId,
        tipo: "REFRESH",
        hashToken,
        expiraEm,
        revogadoEm: null,
        criadoEm: params.agora,
        proximoTokenId: null,
        proximoUsuarioId: null,
      });

      if (!inserirRes.ok) return inserirRes;

      return {
        ok: true as const,
        value: { tokenBruto, tokenId, expiraEm },
      };
    },

    async validarRefresh(params: {
      locatarioId: string;
      tokenBruto: string;
      agora: Date;
    }) {
      const res = await tokensRepo.buscarPorHash({
        locatarioId: params.locatarioId,
        hashToken: `hash:${params.tokenBruto}`,
      });

      if (!res.ok) return res;
      if (!res.value) {
        return {
          ok: false as const,
          error: {
            codigo: "NAO_AUTENTICADO" as const,
            mensagem: "Refresh inválido.",
          },
        };
      }

      return {
        ok: true as const,
        value: {
          tokenId: res.value.tokenId,
          usuarioId: res.value.usuarioId,
          expiraEm: res.value.expiraEm,
        },
      };
    },

    async revogar(params: {
      locatarioId: string;
      tokenId: string;
      usuarioId: string;
      agora: Date;
      motivo?: string;
    }) {
      return tokensRepo.revogar({
        locatarioId: params.locatarioId,
        tokenId: params.tokenId,
        revogadoPor: params.usuarioId,
        revogadoEm: params.agora,
        motivo: params.motivo,
      });
    },
  };

  const rbacService = {
    resolverPermissoes: async (ctx: any) => resolverPermissoes({ rbacRepo })({ ctx }),
  };

  return {
    repositorios: {
      locatariosRepo,
      usuariosRepo,
      rbacRepo,
      tokensRepo,
    },

    usecases: {
      criarLocatario: criarCriarLocatario({ locRepo: locatariosRepo }),
      listarLocatarios: criarListarLocatarios({ locRepo: locatariosRepo }),
      obterLocatario: criarObterLocatario({ locRepo: locatariosRepo }),

      criarUsuario: criarCriarUsuario({ usuariosRepo }),
      listarUsuarios: criarListarUsuarios({ usuariosRepo }),
      obterUsuario: criarObterUsuario({ usuariosRepo }),

      emitirSessao: criarEmitirSessao({
        usuariosRepo,
        locatariosRepo,
        tokens: tokensService,
        cripto: criptoAuth,
        jwt,
        relogio,
        ids,
      }),
      validarSessao: criarValidarSessao({ jwt }),
      resolverContextoAutorizado: criarResolverContextoAutorizado({
        rbac: rbacService,
      }),
      rotacionarRefresh: criarRotacionarRefresh({
        tokens: tokensService,
        jwt,
        relogio,
        ids,
      }),
    },
  };
}