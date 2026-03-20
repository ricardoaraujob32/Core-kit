import {
 
  criarEmitirSessao,
  criarValidarSessao,
  criarResolverContextoAutorizado,
  criarRotacionarRefresh,
  resolverPermissoes,
  LocatarioId,
  UsuarioId,
  createCriarLocatario,
  createListarLocatarios,
  createObterLocatario,
  createCriarUsuario,
  createListarUsuariosPorLocatario,
  createObterUsuario,
} from "@core-kit/core";

import { criarLocatariosRepositorioMemoria } from "@core-kit/core";
import { criarUsuariosRepositorioMemoria } from "@core-kit/core";
import { criarRbacRepositorioMemoria } from "@core-kit/core";
import { criarTokensRepositorioMemoria } from "@core-kit/core";

const ACCESS_TOKEN_TTL_SEGUNDOS = 10 * 60;
const REFRESH_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const ISSUER = "core-kit-api";

function base64UrlEncode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

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
      usuarioId: UsuarioId;
      locatarioId: LocatarioId;
      sessionId: string;
      agora: Date;
      ttlSegundos?: number;
      issuer?: string;
    }) {
      const ttlSegundos = params.ttlSegundos ?? ACCESS_TOKEN_TTL_SEGUNDOS;
      const issuer = params.issuer ?? ISSUER;
      const iat = Math.floor(params.agora.getTime() / 1000);
      const exp = iat + ttlSegundos;

      const payload = {
        sub: params.usuarioId,
        loc: params.locatarioId,
        sid: params.sessionId,
        iat,
        exp,
        iss: issuer,
      };

      return {
        ok: true as const,
        value: {
          token: base64UrlEncode(payload),
          expiraEm: new Date(exp * 1000),
        },
      };
    },

    async validarAccessToken(token: string) {
      try {
        const payload = JSON.parse(
          Buffer.from(token, "base64url").toString("utf8"),
        ) as {
          sub?: string;
          loc?: string;
          sid?: string;
          exp?: number;
          iss?: string;
        };

        if (!payload.sub || !payload.loc || !payload.exp) {
          return {
            ok: false as const,
            error: {
              codigo: "NAO_AUTENTICADO" as const,
              mensagem: "Token inválido.",
            },
          };
        }

        if (payload.iss !== ISSUER) {
          return {
            ok: false as const,
            error: {
              codigo: "NAO_AUTENTICADO" as const,
              mensagem: "Issuer do token inválido.",
            },
          };
        }

        if (payload.exp * 1000 <= Date.now()) {
          return {
            ok: false as const,
            error: {
              codigo: "NAO_AUTENTICADO" as const,
              mensagem: "Token expirado.",
            },
          };
        }

        return {
          ok: true as const,
          value: {
            usuarioId: payload.sub,
            locatarioId: payload.loc,
            sessionId: payload.sid,
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
      locatarioId: LocatarioId;
      usuarioId: UsuarioId;
      agora: Date;
      ttlMs?: number;
    }) {
      const tokenId = crypto.randomUUID();
      const tokenBruto = crypto.randomUUID();
      const hashToken = `hash:${tokenBruto}`;
      const expiraEm = new Date(
        params.agora.getTime() + (params.ttlMs ?? REFRESH_TOKEN_TTL_MS),
      );

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

      if (res.value.expiraEm.getTime() <= params.agora.getTime()) {
        return {
          ok: false as const,
          error: {
            codigo: "NAO_AUTENTICADO" as const,
            mensagem: "Refresh expirado.",
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
    resolverPermissoes: async (ctx: unknown) =>
      resolverPermissoes({ rbacRepo })({ ctx: ctx as never }),
  };

  const usecases = {
    criarLocatario: createCriarLocatario({ locRepo: locatariosRepo }),
    listarLocatarios: createListarLocatarios({ locRepo: locatariosRepo }),
    obterLocatario: createObterLocatario({ locRepo: locatariosRepo }),

    criarUsuario: createCriarUsuario({ usuariosRepo }),
    listarUsuarios: createListarUsuariosPorLocatario({ usuariosRepo }),
    obterUsuario: createObterUsuario({ usuariosRepo }),

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
  };

  return {
    repositorios: {
      locatariosRepo,
      usuariosRepo,
      rbacRepo,
      tokensRepo,
    },
    services: {
      modulosHabilitadosService: {
        async listarModulosHabilitados() {
          return {
            ok: true as const,
            value: {
              modulos: [
                { codigo: "CORE" as const },
                { codigo: "ADMIN" as const },
              ],
            },
          };
        },
      },
    },
    usecases,
    http: {
      buildContext: null as unknown,
    },
  };
}