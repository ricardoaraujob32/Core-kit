// apps/api/src/infra/auth/hashPorta.ts

import bcrypt from "bcryptjs";
import { createErroApp, wrapOk, type HashAuthPorta } from "@core-kit/core";

/**
 * Implementação da porta de hashing de autenticação.
 *
 * Responsabilidade:
 * - comparar senha em texto puro com o hash persistido;
 * - encapsular falhas técnicas como `ErroApp`.
 */
export const hashPorta: HashAuthPorta = {
   /**
   * Compara uma senha informada na borda com o hash persistido no banco.
   *
   * @param senha Senha em texto puro recebida do usuário.
   * @param senhaHash Hash persistido.
   * @returns `Ok(true/false)` conforme o resultado da comparação.
   */
  async compararSenha(senha: string, senhaHash: string) {
    try {
      const ok = await bcrypt.compare(senha, senhaHash);
      return wrapOk(ok);
    } catch (causa) {
      return createErroApp({
        codigo: "ERRO_INTERNO",
        mensagem: "Falha ao comparar senha.",
        detalhes: {
          operacao: "auth.hash.compararSenha",
        },
        causa,
      });
    }
  },
};
