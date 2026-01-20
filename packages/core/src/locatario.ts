/**
 * Tipos base para multi-locatário (multi-tenant).
 * "Locatário" é a empresa/cliente dono do contexto.
 */

export type LocatarioId = string;
export type UsuarioId = string;

/**
 * "Papel" é um rótulo (apelido) que pode variar por locatário.
 * Ex.: "ADMIN_LOCATARIO", "GERENTE", "OPERADOR".
 *
 * Papel ajuda na UX e organização, mas o motor real de autorização usa permissões.
 */
export type Papel = string;

/**
 * Permissão é a unidade real de autorização.
 * Formato recomendado: "<recurso>:<acao>"
 * Ex.: "usuarios:criar", "auditoria:ler", "locatario:configurar"
 */
export type Permissao = string;

/**
 * ContextoExecucao representa as informações mínimas para execução segura:
 * - quem (usuarioId)
 * - em qual locatário (locatarioId)
 * - quais permissões já foram resolvidas (permissoes)
 */
export type ContextoExecucao = {
  locatarioId: LocatarioId;
  usuarioId?: UsuarioId;
  papeis?: Papel[];
  permissoes?: Permissao[];
};
