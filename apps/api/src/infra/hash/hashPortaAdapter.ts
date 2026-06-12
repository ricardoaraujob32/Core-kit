// apps/api/src/infra/hash/hashPortaAdapter.ts

import type { HashPorta } from "@core-kit/core";
import { hashPorta } from "../prisma/auth/hashPorta.js";

export function createHashPortaAdapter(): HashPorta {
  return {
    async gerarHash(textoPlano) {
      const resultado = await hashPorta.gerarHashSenha(textoPlano);

      if (!resultado.ok) {
        throw new Error(resultado.error.mensagem);
      }

      return resultado.value;
    },

    async comparar(textoPlano, hash) {
      const resultado = await hashPorta.compararSenha(textoPlano, hash);

      if (!resultado.ok) {
        throw new Error(resultado.error.mensagem);
      }

      return resultado.value;
    },
  };
}