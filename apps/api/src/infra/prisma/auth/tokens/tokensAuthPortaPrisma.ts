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
     * 4. retorna token bruto ao chamador.
     *
     * @param params Dados necessários para materializar o token.
     * @returns `Ok({ tokenId, tokenBruto, expiraEm })` em caso de sucesso.
     */
    async criarRefresh(params) {
      try {
        const tokenBruto = gerarRefreshTokenBruto();
        const hashToken = hashRefreshToken(tokenBruto);
        const tokenId = idPorta.gerarId() as TokenId;
        const expiraEm = new Date(params.agora.getTime() + params.ttlMs);

        await db.tokens.create({
          data: {
            token_id: tokenId,
            usuario_id: params.usuarioId,
            locatario_id: params.locatarioId,
            hash_token: hashToken,
            tipo: "REFRESH",
            expira_em: expiraEm,
          },
        });

        return wrapOk({
          tokenId,
          tokenBruto,
          expiraEm,
        });
      } catch (causa) {
        return erroInfraAuth({
          mensagem: "Falha ao criar refresh token.",
          operacao: "auth.tokens.criarRefresh",
          causa,
          detalhes: {
            locatarioId: params.locatarioId,
            usuarioId: params.usuarioId,
          },
        });
      }
    },

    /**
     * Valida o refresh token recebido do cliente.
     *
     * Fluxo:
     * 1. aplica hash ao token recebido;
     * 2. busca no banco;
     * 3. valida existência, revogação e expiração.
     *
     * @param params Token bruto, locatário e relógio da operação.
     * @returns `Ok(...)` quando o refresh é válido.
     */
    async validarRefresh(params) {
      try {
        const hashToken = hashRefreshToken(params.tokenBruto);

        const row = await db.tokens.findFirst({
          where: {
            locatario_id: params.locatarioId,
            hash_token: hashToken,
            tipo: "REFRESH",
          },
          select: {
            token_id: true,
            usuario_id: true,
            locatario_id: true,
            expira_em: true,
            revogado_em: true,
          },
        });

        if (!row || !row.locatario_id) {
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
        return erroInfraAuth({
          mensagem: "Falha ao validar refresh token.",
          operacao: "auth.tokens.validarRefresh",
          causa,
          detalhes: {
            locatarioId: params.locatarioId,
          },
        });
      }
    },

    /**
     * Revoga um refresh token existente.
     *
     * @param params.tokenId Identificador do token.
     * @param params.agora Timestamp da revogação.
     * @returns `Ok(void)` quando a operação é concluída.
     */
    async revogar(params) {
      try {
        const token = await db.tokens.findFirst({
          where: {
            token_id: params.tokenId,
            tipo: "REFRESH",
          },
          select: {
            token_id: true,
            usuario_id: true,
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
            token_id_usuario_id: {
              token_id: token.token_id,
              usuario_id: token.usuario_id,
            },
          },
          data: {
            revogado_em: params.agora,
          },
        });

        return wrapOk(undefined);
      } catch (causa) {
        return erroInfraAuth({
          mensagem: "Falha ao revogar refresh token.",
          operacao: "auth.tokens.revogar",
          causa,
          detalhes: {
            tokenId: params.tokenId,
          },
        });
      }
    },
  };
}
