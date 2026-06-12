// packages/core/src/auditoria/metadados.ts

/**
 * Estrutura canônica de metadados da auditoria.
 */
export type MetadadosAuditoria = {
  /**
   * Estado anterior relevante, quando houver.
   */
  antes?: Record<string, unknown> | null;

  /**
   * Estado final relevante, quando houver.
   */
  depois?: Record<string, unknown> | null;

  /**
   * Informações auxiliares do evento.
   */
  contexto?: Record<string, unknown>;
};

/**
 * Cria metadados de criação.
 *
 * @param depois Estado final criado.
 * @returns Metadados padronizados.
 */
export function metaCriacao(depois: Record<string, unknown>): MetadadosAuditoria {
  return {
    antes: null,
    depois,
    contexto: {},
  };
}

/**
 * Cria metadados de atualização.
 *
 * @param antes Estado anterior.
 * @param depois Estado final.
 * @param campos Campos alterados.
 * @returns Metadados padronizados.
 */
export function metaAtualizacao(antes: Record<string, unknown>, depois: Record<string, unknown>, campos: string[]): MetadadosAuditoria {
  return {
    antes,
    depois,
    contexto: {
      camposAlterados: campos,
    },
  };
}

/**
 * Cria metadados simples de ação.
 *
 * @param contexto Dados auxiliares opcionais.
 * @returns Metadados padronizados.
 */
export function metaAcao(contexto?: Record<string, unknown>): MetadadosAuditoria {
  return {
    contexto: contexto ?? {},
  };
}

/**
 * Cria metadados de impersonação.
 *
 * @param params Dados do modo impersonado.
 * @returns Metadados padronizados.
 */
export function metaImpersonacao(params: { superadminUsuarioId: string; locatarioAlvoId: string; motivo?: string; }): MetadadosAuditoria {
  return {
    contexto: {
      modoImpersonacao: true,
      superadminUsuarioId: params.superadminUsuarioId,
      locatarioAlvoId: params.locatarioAlvoId,
      motivo: params.motivo,
    },
  };
}
