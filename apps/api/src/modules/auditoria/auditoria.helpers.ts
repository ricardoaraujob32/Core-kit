// apps/api/src/modules/auditoria/auditoria.helpers.ts

// apps/api/src/modules/auditoria/auditoria.helpers.ts

/**
 * Categoria canônica dos eventos de auditoria.
 */
export type CategoriaAuditoria =
  | "OPERACAO"
  | "SEGURANCA"
  | "ERRO"
  | "COMPLIANCE";

/**
 * Parâmetros aceitos pelo publicador de auditoria do locatário.
 *
 * Observação:
 * - representa exclusivamente eventos destinados à tabela
 *   `auditoria_locatario`;
 * - não deve ser usado para auditoria de plataforma.
 */
export type TentarAuditarLocatarioParams = {
  locatarioId: string;
  usuarioId: string | null;
  evento: string;
  categoria: CategoriaAuditoria;
  sucesso: boolean;
  entidadeTipo?: string | null;
  entidadeNome?: string | null;
  entidadeId?: string | null;
  erroCodigo?: string | null;
  erroMensagem?: string | null;
  origem?: string | null;
  requisicaoId?: string | null;
  enderecoIp?: string | null;
  agenteUsuario?: string | null;
  agenteTipo?: string | null;
  metadados?: Record<string, unknown>;
};

/**
 * Parâmetros aceitos pelo publicador de auditoria da plataforma.
 *
 * Observação:
 * - representa exclusivamente eventos destinados à tabela
 *   `auditoria_plataforma`;
 * - `locatarioAlvoId` deve ser preenchido quando a ação de plataforma
 *   afetar um locatário específico, inclusive em impersonação.
 */
export type TentarAuditarPlataformaParams = {
  usuarioId: string | null;
  evento: string;
  categoria: CategoriaAuditoria;
  sucesso: boolean;
  locatarioAlvoId?: string | null;
  entidadeTipo?: string | null;
  entidadeNome?: string | null;
  entidadeId?: string | null;
  erroCodigo?: string | null;
  erroMensagem?: string | null;
  origem?: string | null;
  requisicaoId?: string | null;
  enderecoIp?: string | null;
  agenteUsuario?: string | null;
  agenteTipo?: string | null;
  metadados?: Record<string, unknown>;
};
