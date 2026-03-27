// apps/api/src/infra/auth/jwtPorta.ts

import jwt from "jsonwebtoken";
import { createErroApp, wrapOk } from "@core-kit/core";
import type { JwtAuthPorta, UsuarioId, LocatarioId } from "@core-kit/core";
import { env } from "../../../env";;

/**
 * Payload interno esperado para os JWTs de autenticação.
 *
 * Este shape reflete o contrato definido pelo Core para sessões autenticadas:
 * - `sub`: usuário autenticado
 * - `loc`: locatário do token
 * - `session`: identificador lógico da sessão
 * - `exp`: expiração em epoch seconds
 */
type JwtPayloadInterno = {
  sub: UsuarioId;
  loc: LocatarioId;
  session: string;
  iat?: number;
  exp?: number;
  iss?: string;
};

/**
 * Verifica se um valor é string não vazia.
 *
 * Usado para validar claims obrigatórios no payload JWT.
 *
 * @param value Valor a validar.
 * @returns `true` quando o valor for string não vazia.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Implementação da porta de JWT usada por `auth`.
 *
 * Responsabilidades:
 * - emitir access token no formato esperado pelo Core;
 * - validar access token recebido da borda;
 * - traduzir falhas técnicas para `ErroApp`.
 */
export const jwtPorta: JwtAuthPorta = {
   /**
   * Emite um access token e devolve também o payload lógico resultante.
   *
   * @param params Dados necessários para materializar a sessão.
   * @returns `Ok({ token, payload })` em caso de sucesso.
   */
  async emitirAccessToken(params) {
    try {
      const payloadBase = {
        sub: params.usuarioId,
        loc: params.locatarioId,
        session: params.sessionId,
      };

      const token = jwt.sign(payloadBase, env.JWT_SECRET, {
        issuer: params.issuer,
        expiresIn: params.ttlSegundos,
      });

      const decoded = jwt.decode(token);

      if (!decoded || typeof decoded !== "object") {
        return createErroApp({
          codigo: "ERRO_INTERNO",
          mensagem: "Falha ao decodificar token recém-emitido.",
          detalhes: {
            operacao: "auth.jwt.emitirAccessToken.decode",
          },
        });
      }

      const payload = decoded as JwtPayloadInterno;

      if (
        !isNonEmptyString(payload.sub) ||
        !isNonEmptyString(payload.loc) ||
        !isNonEmptyString(payload.session) ||
        typeof payload.exp !== "number"
      ) {
        return createErroApp({
          codigo: "ERRO_INTERNO",
          mensagem: "Payload do token emitido está inválido.",
          detalhes: {
            operacao: "auth.jwt.emitirAccessToken.payload",
          },
        });
      }

      return wrapOk({
        token,
        payload: {
          sub: payload.sub,
          loc: payload.loc,
          session: payload.session,
          exp: payload.exp,
        },
      });
    } catch (causa) {
      return createErroApp({
        codigo: "ERRO_INTERNO",
        mensagem: "Falha ao emitir access token.",
        detalhes: {
          operacao: "auth.jwt.emitirAccessToken",
        },
        causa,
      });
    }
  },

  /**
   * Valida um access token recebido da borda HTTP.
   *
   * @param token Token JWT bruto.
   * @returns `Ok(payload)` quando o token for válido e contiver os claims obrigatórios.
   */
  validarAccessToken(token: string) {
    try {
      const verified = jwt.verify(token, env.JWT_SECRET, {
        issuer: env.JWT_ISSUER,
      });

      if (!verified || typeof verified !== "object") {
        return createErroApp({
          codigo: "NAO_AUTENTICADO",
          mensagem: "Access token inválido.",
          detalhes: {
            operacao: "auth.jwt.validarAccessToken",
            motivo: "payload_invalido",
          },
        });
      }

      const payload = verified as JwtPayloadInterno;

      if (
        !isNonEmptyString(payload.sub) ||
        !isNonEmptyString(payload.loc) ||
        !isNonEmptyString(payload.session) ||
        typeof payload.exp !== "number"
      ) {
        return createErroApp({
          codigo: "NAO_AUTENTICADO",
          mensagem: "Claims obrigatórios ausentes no access token.",
          detalhes: {
            operacao: "auth.jwt.validarAccessToken",
            motivo: "claims_ausentes",
          },
        });
      }

      return wrapOk({
        sub: payload.sub,
        loc: payload.loc,
        session: payload.session,
        exp: payload.exp,
      });
    } catch (causa) {
      return createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Access token ausente, inválido ou expirado.",
        detalhes: {
          operacao: "auth.jwt.validarAccessToken",
        },
        causa,
      });
    }
  },
};
