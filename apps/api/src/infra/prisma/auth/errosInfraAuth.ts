// apps/api/src/infra/auth/compartilhado/errosInfraAuth.ts

import { createErroApp } from "@core-kit/core";

/**
 * Parâmetros aceitos pelo helper de erro da infraestrutura de autenticação.
 *
 * Responsabilidades:
 * - padronizar erros técnicos da auth;
 * - tornar `operacao` obrigatória para rastreabilidade;
 * - manter `detalhes` enxutos e úteis para diagnóstico.
 */
export type ErroInfraAuthParams = {
  /**
   * Mensagem final do erro.
   *
   * Deve ser curta, humana e apropriada para logs e rastreio interno.
   */
  mensagem: string;

  /**
   * Identificador estável da operação que falhou.
   *
   * Formato recomendado:
   * `modulo.recurso.acao`
   *
   * Exemplos:
   * - `auth.usuarios.buscarPorEmail`
   * - `auth.tokens.criarRefresh`
   * - `auth.rbac.resolverPermissoes`
   */
  operacao: string;

  /**
   * Erro técnico original capturado na infraestrutura.
   */
  causa: unknown;

  /**
   * Contexto adicional útil e seguro para diagnóstico.
   *
   * Não incluir dados sensíveis como:
   * - senha
   * - token bruto
   * - hash
   * - segredo JWT
   */
  detalhes?: Record<string, unknown>;
};

/**
 * Cria um `ErroApp` padronizado para falhas técnicas da autenticação.
 *
 * Este helper deve ser usado nos adapters da área de auth quando a falha:
 * - não for uma violação de regra de domínio;
 * - não for um caso esperado de negócio;
 * - e representar problema técnico de persistência, infraestrutura ou integração.
 *
 * @param params Dados necessários para materializar o erro padronizado.
 * @returns `Err(ErroApp)` com código `ERRO_INTERNO`.
 */
export function erroInfraAuth(params: ErroInfraAuthParams) {
  return createErroApp({
    codigo: "ERRO_INTERNO",
    mensagem: params.mensagem,
    detalhes: {
      operacao: params.operacao,
      ...params.detalhes,
    },
    causa: params.causa,
  });
}
