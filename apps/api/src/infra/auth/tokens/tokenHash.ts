// apps/api/src/infra/auth/tokens/tokenHash.ts

import { createHash, randomBytes } from "node:crypto";

/**
 * Gera hash SHA-256 de um refresh token.
 *
 * Uso:
 * - armazenar apenas hash no banco;
 * - evitar persistência do token bruto.
 *
 * @param tokenBruto Token original gerado.
 * @returns Hash do token.
 */
export function hashRefreshToken(tokenBruto: string): string {
  return createHash("sha256").update(tokenBruto, "utf8").digest("hex");
}

/**
 * Gera um refresh token seguro.
 *
 * Características:
 * - alta entropia (48 bytes);
 * - codificação URL-safe;
 *
 * @returns Token bruto a ser entregue ao cliente.
 */
export function gerarRefreshTokenBruto(): string {
  return randomBytes(48).toString("base64url");
}