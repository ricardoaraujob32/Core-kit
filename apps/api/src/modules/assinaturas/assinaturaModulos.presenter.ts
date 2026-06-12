// apps/api/src/modules/assinaturas/assinaturaModulos.presenter.ts

import type { ModuloHabilitado, ModuloHabilitadoAssinatura } from "@core-kit/core";

export function toModuloHabilitadoDto(modulo: ModuloHabilitado) {
  return {
    codigo: modulo.codigo,
    origem: modulo.origem,
  };
}

export function toVinculoModuloDto(vinculo: ModuloHabilitadoAssinatura) {
  return {
    assinaturaId: vinculo.assinaturaId,
    moduloId: vinculo.moduloId,
    origem: vinculo.origem,
    gratuito: vinculo.gratuito,
    habilitadoEm: vinculo.habilitadoEm.toISOString(),
    desabilitadoEm: vinculo.desabilitadoEm?.toISOString() ?? null,
  };
}
