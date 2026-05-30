// apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts

import { createErroApp, IdPorta, TokenId, TokensAuthPorta, wrapOk } from "@core-kit/core";
import { gerarRefreshTokenBruto, hashRefreshToken } from "./tokenHash";
import { erroInfraAuth } from "../errosInfraAuth";
import { PrismaDb } from "../../tipos";

type TokenRow = {
  token_id: string;
  usuario_id: string;
  locatario_id: string | null;
  expira_em: Date;
  revogado_em: Date | null;
};

/**
 * Adapter Prisma -> TokensAuthPorta.
 *
 * Modelo novo:
 * - core.tokens_locatario: refresh tokens de usuários de locatário.
 * - core.tokens_plataforma: refresh tokens de usuários da plataforma.
 *
 * Segurança:
 * - apenas o hash do token é persistido;
 * - o token bruto nunca é armazenado;
 * - validação ocorre via hash.
 */
export function createTokensAuthPorta(db: PrismaDb, idPorta: IdPorta): TokensAuthPorta {
  return {
    async criarRefresh(params) {
      try {
        const tokenBruto = gerarRefreshTokenBruto();
        const hashToken = hashRefreshToken(tokenBruto);
        const tokenId = idPorta.gerarId() as TokenId;
        const expiraEm = new Date(params.agora.getTime() + params.ttlMs);

        if (params.locatarioId === null) {
          await db.$executeRaw`
            INSERT INTO core.tokens_plataforma (
              token_id,
              usuario_id,
              hash_token,
              tipo,
              expira_em
            )
            VALUES (
              ${tokenId}::uuid,
              ${params.usuarioId}::uuid,
              ${hashToken},
              'REFRESH'::core.tipo_token,
              ${expiraEm}
            )
          `;
        } else {
          await db.$executeRaw`
            INSERT INTO core.tokens_locatario (
              token_id,
              usuario_id,
              locatario_id,
              hash_token,
              tipo,
              expira_em
            )
            VALUES (
              ${tokenId}::uuid,
              ${params.usuarioId}::uuid,
              ${params.locatarioId}::uuid,
              ${hashToken},
              'REFRESH'::core.tipo_token,
              ${expiraEm}
            )
          `;
        }

        return wrapOk({
          chave: {
            tokenId,
            usuarioId: params.usuarioId,
            locatarioId: params.locatarioId,
          },
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

    async validarRefresh(params) {
      try {
        const hashToken = hashRefreshToken(params.tokenBruto);

        const rows = params.locatarioId === null
          ? await db.$queryRaw<TokenRow[]>`
              SELECT
                token_id,
                usuario_id,
                NULL::uuid AS locatario_id,
                expira_em,
                revogado_em
              FROM core.tokens_plataforma
              WHERE hash_token = ${hashToken}
                AND tipo = 'REFRESH'::core.tipo_token
              LIMIT 1
            `
          : await db.$queryRaw<TokenRow[]>`
              SELECT
                token_id,
                usuario_id,
                locatario_id,
                expira_em,
                revogado_em
              FROM core.tokens_locatario
              WHERE locatario_id = ${params.locatarioId}::uuid
                AND hash_token = ${hashToken}
                AND tipo = 'REFRESH'::core.tipo_token
              LIMIT 1
            `;

        const row = rows[0] ?? null;

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
              usuarioId: row.usuario_id,
              locatarioId: row.locatario_id,
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
              usuarioId: row.usuario_id,
              locatarioId: row.locatario_id,
              expiraEm: row.expira_em,
            },
          });
        }

        return wrapOk({
          chave: {
            tokenId: row.token_id as TokenId,
            usuarioId: row.usuario_id,
            locatarioId: row.locatario_id,
          },
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

    async revogar(params) {
      try {
        if (params.chave.locatarioId === null) {
          await db.$executeRaw`
            UPDATE core.tokens_plataforma
            SET
              revogado_em = ${params.agora},
              proximo_token_id = ${params.proximo?.tokenId ?? null}::uuid
            WHERE token_id = ${params.chave.tokenId}::uuid
              AND usuario_id = ${params.chave.usuarioId}::uuid
          `;
        } else {
          await db.$executeRaw`
            UPDATE core.tokens_locatario
            SET
              revogado_em = ${params.agora},
              proximo_token_id = ${params.proximo?.tokenId ?? null}::uuid,
              proximo_usuario_id = ${params.proximo?.usuarioId ?? null}::uuid,
              proximo_locatario_id = ${params.proximo?.locatarioId ?? null}::uuid
            WHERE token_id = ${params.chave.tokenId}::uuid
              AND usuario_id = ${params.chave.usuarioId}::uuid
              AND locatario_id = ${params.chave.locatarioId}::uuid
          `;
        }

        return wrapOk(undefined);
      } catch (causa) {
        return erroInfraAuth({
          mensagem: "Falha ao revogar refresh token.",
          operacao: "auth.tokens.revogar",
          causa,
          detalhes: {
            tokenId: params.chave.tokenId,
            proximoTokenId: params.proximo?.tokenId,
            proximoUsuarioId: params.proximo?.usuarioId,
            proximoLocatarioId: params.proximo?.locatarioId,
          },
        });
      }
    },
  };
}