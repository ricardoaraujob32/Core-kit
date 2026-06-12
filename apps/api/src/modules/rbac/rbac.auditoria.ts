// apps/api/src/modules/rbac/rbac.auditoria.ts

import { metaAcao, metaCriacao, metaAtualizacao } from "@core-kit/core";

/**
 * Metadados para criação de papel.
 *
 * @param params Dados finais do papel criado.
 * @returns Metadados padronizados.
 */
export function metaCriacaoPapel(params: { papelId: string; nome: string; descricao?: string | null; }) {
  return metaCriacao({
    papelId: params.papelId,
    nome: params.nome,
    descricao: params.descricao ?? null,
  });
}

/**
 * Metadados para atualização de papel.
 *
 * @param antes Estado anterior.
 * @param depois Estado final.
 * @returns Metadados padronizados.
 */
export function metaAtualizacaoPapel(
  antes: { nome: string; descricao?: string | null },
  depois: { nome: string; descricao?: string | null },
) {
  const camposAlterados = [
    ...(antes.nome !== depois.nome ? ["nome"] : []),
    ...((antes.descricao ?? null) !== (depois.descricao ?? null)
      ? ["descricao"]
      : []),
  ];

  return metaAtualizacao(
    {
      nome: antes.nome,
      descricao: antes.descricao ?? null,
    },
    {
      nome: depois.nome,
      descricao: depois.descricao ?? null,
    },
    camposAlterados,
  );
}

/**
 * Metadados para atribuição de permissão a papel.
 *
 * @param params Dados da operação.
 * @returns Metadados padronizados.
 */
export function metaAtribuicaoPermissao(params: {
  papelId: string;
  permissao: string;
}) {
  return metaAcao({
    papelId: params.papelId,
    permissao: params.permissao,
  });
}

/**
 * Metadados para remoção de permissão de papel.
 *
 * @param params Dados da operação.
 * @returns Metadados padronizados.
 */
export function metaRemocaoPermissao(params: { papelId: string; permissao: string; }) {
  return metaAcao({
    papelId: params.papelId,
    permissao: params.permissao,
  });
}

/**
 * Metadados para atualização de papéis de um usuário.
 *
 * @param params Dados da operação.
 * @returns Metadados padronizados.
 */
export function metaAtualizacaoPapeisUsuario(params: { papeisAntes: string[]; papeisDepois: string[]; }) {
  return metaAtualizacao(
    {
      papeis: params.papeisAntes,
    },
    {
      papeis: params.papeisDepois,
    },
    ["papeis"],
  );
}

/**
 * Metadados para intervenção de plataforma em RBAC.
 *
 * @param params Dados da intervenção.
 * @returns Metadados padronizados.
 */
export function metaIntervencaoPlataformaRbac(params: {
  tipoIntervencao: string;
  papelId?: string | null;
  usuarioAfetadoId?: string | null;
  motivo?: string | null;
}) {
  return metaAcao({
    tipoIntervencao: params.tipoIntervencao,
    papelId: params.papelId ?? null,
    usuarioAfetadoId: params.usuarioAfetadoId ?? null,
    motivo: params.motivo ?? null,
  });
}
