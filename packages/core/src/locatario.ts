/**
 * Tipos base para multi-locatário (multi-tenant).
 * "Locatário" é a empresa/cliente dono do contexto.
 */

export type LocatarioId = string;
export type UsuarioId = string;

/**
 * "Papel" é um rótulo (apelido) que pode variar por locatário.
 * Ex.: "ADMIN_LOCATARIO", "GERENTE", "OPERADOR"
 *
 * Não confundir papel com permissão. Papel é UX + organização.
 */
export type Papel = string;

/**
 * Permissão é a unidade real de autorização.
 * Formato recomendado: "<recurso>:<acao>"
 * Ex.: "usuarios:criar", "auditoria:ler", "locatario:configurar"
 */
export type Permissao = string;

export type ContextoExecucao = {
  locatarioId: LocatarioId;
  usuarioId?: UsuarioId;

  /**
   * Papéis do usuário no locatário atual (opcional, útil para UI e auditoria).
   */
  papeis?: Papel[];

  /**
   * Permissões já resolvidas para o usuário no locatário atual.
   * Esta lista é o que o RBAC usa de verdade.
   */
  permissoes?: Permissao[];
};
