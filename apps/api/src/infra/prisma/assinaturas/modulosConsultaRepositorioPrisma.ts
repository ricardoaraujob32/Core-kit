// apps/api/src/infra/prisma/assinaturas/modulosConsultaRepositorioPrisma.ts

import type {
  ListarModulosGratisResult,
  ModuloId,
  ModulosConsultaRepositorio,
  ValidarModuloExistenteResult,
} from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";

export function createModulosConsultaRepositorioPrisma(
  db: PrismaDb,
): ModulosConsultaRepositorio {
  return {
    async validarModuloAtivo(moduloId: ModuloId) {
      try {
        const modulo = await db.modulos.findUnique({
          where: { modulo_id: moduloId },
          select: { modulo_id: true, ativo: true },
        });

        const result: ValidarModuloExistenteResult | null = modulo
          ? { moduloId: modulo.modulo_id, ativo: modulo.ativo }
          : null;

        return wrapOk(result);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "modulos",
          operacao: "infra.prisma.modulos.validarModuloAtivo",
          detalhes: { moduloId },
        });
      }
    },

    async listarModulosGratis() {
      const result: ListarModulosGratisResult[] = [];
      return wrapOk(result);
    },
  };
}
