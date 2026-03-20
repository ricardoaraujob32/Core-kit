// 

import { criarPermissoesRepositorioPrisma } from "../../rbac/infra/permissoesRepositorioPrisma";
import { criarTokensRepositorioPrisma } from "../../tokens/infra/tokensRepositorioPrisma";

/**
 * 
 * @param prisma 
 * @returns 
 */
export function criarAuthInfraPrisma(prisma: PrismaClient) {
  return {
    async emTransacao<T>(
      fn: (deps: {
        usuariosRepo: ReturnType<typeof criarUsuariosRepositorioPrisma>;
        tokensRepo: ReturnType<typeof criarTokensRepositorioPrisma>;
        permissoesRepo: ReturnType<typeof criarPermissoesRepositorioPrisma>;
      }) => Promise<T>
    ): Promise<T> {
      return prisma.$transaction(async (tx) => {
        const usuariosRepo = criarUsuariosRepositorioPrisma(tx);
        const tokensRepo = criarTokensRepositorioPrisma(tx);
        const permissoesRepo = criarPermissoesRepositorioPrisma(tx);

        return fn({
          usuariosRepo,
          tokensRepo,
          permissoesRepo,
        });
      });
    },
  };
}