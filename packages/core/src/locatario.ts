/**
 * Tipos base para multi-locatário (multi-tenant).
 * "Locatário" é a empresa/cliente dono do contexto.
 *
 * Observações:
 * - Mantemos `Papel` e `Permissao` como `string` para não engessar o domínio.
 * - Fornecemos constantes e helpers tipados para reduzir erros de digitação.
 * - `usuarioId`, `papeis` e `permissoes` podem ser `undefined` para representar contexto
 *   não autenticado (ex.: endpoints públicos). A camada de RBAC decide como tratar.
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
 * Papéis sugeridos (opcionais). Use se fizer sentido para o projeto.
 * Mantido em português para facilitar documentação e consistência.
 */
export const PAPEIS_PADRAO = {
  ADMIN: "ADMIN", // administração geral do locatário
  GERENTE: "GERENTE", // nível intermediário (ex.: gerente / supervisor)
  OPERADOR: "OPERADOR", // usuário operacional
  LEITOR: "LEITOR", // acesso somente leitura
} as const;

export type PapelPadrao = (typeof PAPEIS_PADRAO)[keyof typeof PAPEIS_PADRAO];

/**
 * Helper para construir permissões no formato `recurso:acao`.
 * Ex.: permissao("usuarios", "criar") -> "usuarios:criar"
 */
export function permissao(recurso: string, acao: string): Permissao {
  return `${recurso}:${acao}`;
}

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

/**
 * Type-guard: indica se o contexto tem usuário autenticado.
 */
export function temUsuario(
  ctx: ContextoExecucao,
): ctx is ContextoExecucao & { usuarioId: UsuarioId } {
  return typeof ctx.usuarioId === "string" && ctx.usuarioId.length > 0;
}

/**
 * Normaliza permissões (sempre retorna array).
 * Útil para evitar `ctx.permissoes ?? []` espalhado.
 */
export function permissoesDo(ctx: ContextoExecucao): Permissao[] {
  return Array.isArray(ctx.permissoes) ? ctx.permissoes : [];
}

/**
 * Normaliza papéis (sempre retorna array).
 */
export function papeisDo(ctx: ContextoExecucao): Papel[] {
  return Array.isArray(ctx.papeis) ? ctx.papeis : [];
}
