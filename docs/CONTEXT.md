
---

```md
# CONTEXT.md

## Objetivo

Definir o contrato do **Contexto de Execução** (`ContextoExecucao`), que representa:

- identidade
- escopo multi-tenant
- autorização
- metadados operacionais

Princípio central:

👉 Nenhuma operação relevante ocorre sem contexto explícito.

---

## Conceito

O contexto é a fonte de verdade sobre:

- quem executa
- em qual locatário
- com quais permissões
- em qual momento

---

## Estrutura mínima recomendada

Exemplo conceitual:

```ts
export type ContextoExecucao = {
  locatarioId: LocatarioId;
  usuarioId?: UsuarioId | null;
  papeis?: Papel[];
  permissoes?: Permissao[];
  agora?: () => Date;
};