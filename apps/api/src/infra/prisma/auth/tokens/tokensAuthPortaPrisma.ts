// apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts

import { createErroApp, IdPorta, TokenId, TokensAuthPorta, wrapOk } from "@core-kit/core";
import { gerarRefreshTokenBruto, hashRefreshToken } from "./tokenHash";
import { erroInfraAuth } from "../errosInfraAuth";
import { PrismaDb } from "../../tipos";

/**
 * Adapter Prisma -> TokensAuthPorta.
 *
 * Responsabilidades:
 * - criar refresh tokens seguros (token + hash);
 * - validar refresh tokens;
 * - revogar tokens.
 *
 * Segurança:
 * - apenas o hash do token é persistido no banco;
 * - o token bruto nunca é armazenado;
 * - validação ocorre via hash (similar a senha).
 */
export function createTokensAuthPorta(db: PrismaDb, idPorta: IdPorta): TokensAuthPorta {
  return {
    /**
     * Cria um novo refresh token.
     *
     * Fluxo:
     * 1. gera token bruto aleatório;
     * 2. gera hash do token;
     * 3. persiste apenas o hash;
     * 4. retorna token bruto ao cliente.
     */
    async criarRefresh(params) {
      try {
        const tokenBruto = gerarRefreshTokenBruto();
        const tokenHash = hashRefreshToken(tokenBruto);
        const tokenId = idPorta.gerarId() as TokenId;
        const expiraEm = new Date(params.agora.getTime() + params.ttlMs);

        await db.tokens.create({
          data: {
            token_id: tokenId,
            locatario_id: params.locatarioId,
            usuario_id: params.usuarioId,
            token_hash: tokenHash,
            expira_em: expiraEm,
          },
        });

        return wrapOk({
          tokenId,
          tokenBruto,
          expiraEm,
        });
      } catch (causa) {
        return erroInfraAuth("Falha ao criar refresh token.", causa, {
          operacao: "auth.tokens.criarRefresh",
          locatarioId: params.locatarioId,
          usuarioId: params.usuarioId,
        });
      }
    },

    /**
     * Valida refresh token recebido do cliente.
     *
     * Fluxo:
     * 1. aplica hash no token recebido;
     * 2. busca no banco;
     * 3. valida:
     *    - existência
     *    - não revogado
     *    - não expirado
     */
    async validarRefresh(params) {
      try {
        const tokenHash = hashRefreshToken(params.tokenBruto);

        const row = await db.tokens.findFirst({
          where: {
            locatario_id: params.locatarioId,
            token_hash: tokenHash,
          },
          select: {
            token_id: true,
            usuario_id: true,
            locatario_id: true,
            expira_em: true,
            revogado_em: true,
          },
        });

        if (!row) {
          return createErroApp({
            codigo: "NAO_AUTENTICADO",
            mensagem: "Refresh token inválido.",
            detalhes: {
              operacao: "auth.tokens.validarRefresh",
              motivo: "token_nao_encontrado",
            },
          });
        }

        if (row.revogado_em) {
          return createErroApp({
            codigo: "NAO_AUTENTICADO",
            mensagem: "Refresh token revogado.",
            detalhes: {
              operacao: "auth.tokens.validarRefresh",
              tokenId: row.token_id,
            },
          });
        }

        if (row.expira_em.getTime() <= params.agora.getTime()) {
          return createErroApp({
            codigo: "NAO_AUTENTICADO",
            mensagem: "Refresh token expirado.",
            detalhes: {
              operacao: "auth.tokens.validarRefresh",
              tokenId: row.token_id,
              expiraEm: row.expira_em,
            },
          });
        }

        return wrapOk({
          tokenId: row.token_id,
          usuarioId: row.usuario_id,
          locatarioId: row.locatario_id,
        });
      } catch (causa) {
        return erroInfraAuth("Falha ao validar refresh token.", causa, {
          operacao: "auth.tokens.validarRefresh",
          locatarioId: params.locatarioId,
        });
      }
    },

    /**
     * Revoga um refresh token existente.
     *
     * @param params.tokenId Identificador do token.
     */
    async revogar(params) {
      try {
        const token = await db.tokens.findFirst({
          where: {
            token_id: params.tokenId,
          },
          select: {
            token_id: true,
            locatario_id: true,
          },
        });

        if (!token) {
          return createErroApp({
            codigo: "NAO_ENCONTRADO",
            mensagem: "Token não encontrado para revogação.",
            detalhes: {
              operacao: "auth.tokens.revogar",
              tokenId: params.tokenId,
            },
          });
        }

        await db.tokens.update({
          where: {
            locatario_id_token_id: {
              locatario_id: token.locatario_id,
              token_id: token.token_id,
            },
          },
          data: {
            revogado_em: params.agora,
          },
        });

        return wrapOk(undefined);
      } catch (causa) {
        return erroInfraAuth("Falha ao revogar refresh token.", causa, {
          operacao: "auth.tokens.revogar",
          tokenId: params.tokenId,
        });
      }
    },
  };
}
