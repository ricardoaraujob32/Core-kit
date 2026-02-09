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
/**
 * Papéis sugeridos (opcionais). Use se fizer sentido para o projeto.
 * Mantido em português para facilitar documentação e consistência.
 */
export const PAPEIS_PADRAO = {
    ADMIN: "ADMIN", // administração geral do locatário
    GERENTE: "GERENTE", // nível intermediário (ex.: gerente / supervisor)
    OPERADOR: "OPERADOR", // usuário operacional
    LEITOR: "LEITOR", // acesso somente leitura
};
/**
 * Helper para construir permissões no formato `recurso:acao`.
 * Ex.: permissao("usuarios", "criar") -> "usuarios:criar"
 */
export function permissao(recurso, acao) {
    return `${recurso}:${acao}`;
}
/**
 * Type-guard: indica se o contexto tem usuário autenticado.
 */
export function temUsuario(ctx) {
    return typeof ctx.usuarioId === "string" && ctx.usuarioId.length > 0;
}
/**
 * Normaliza permissões (sempre retorna array).
 * Útil para evitar `ctx.permissoes ?? []` espalhado.
 */
export function permissoesDo(ctx) {
    return Array.isArray(ctx.permissoes) ? ctx.permissoes : [];
}
/**
 * Normaliza papéis (sempre retorna array).
 */
export function papeisDo(ctx) {
    return Array.isArray(ctx.papeis) ? ctx.papeis : [];
}
//# sourceMappingURL=locatario.js.map