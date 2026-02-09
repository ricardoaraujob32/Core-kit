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
export declare const PAPEIS_PADRAO: {
    readonly ADMIN: "ADMIN";
    readonly GERENTE: "GERENTE";
    readonly OPERADOR: "OPERADOR";
    readonly LEITOR: "LEITOR";
};
export type PapelPadrao = (typeof PAPEIS_PADRAO)[keyof typeof PAPEIS_PADRAO];
/**
 * Helper para construir permissões no formato `recurso:acao`.
 * Ex.: permissao("usuarios", "criar") -> "usuarios:criar"
 */
export declare function permissao(recurso: string, acao: string): Permissao;
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
export declare function temUsuario(ctx: ContextoExecucao): ctx is ContextoExecucao & {
    usuarioId: UsuarioId;
};
/**
 * Normaliza permissões (sempre retorna array).
 * Útil para evitar `ctx.permissoes ?? []` espalhado.
 */
export declare function permissoesDo(ctx: ContextoExecucao): Permissao[];
/**
 * Normaliza papéis (sempre retorna array).
 */
export declare function papeisDo(ctx: ContextoExecucao): Papel[];
//# sourceMappingURL=locatario.d.ts.map