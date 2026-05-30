# Ordem recomendada de implementação — estrutura do BD

Foco desta etapa:
- papéis administrativos;
- schemas;
- tipos de dados;
- estrutura de tabelas;
- ownership por `posse`;
- execução dos scripts pelo papel `migracao`.

Fora desta etapa:
- índices;
- triggers;
- funções;
- RLS/policies;
- seeds;
- smoke tests.

## Ordem

1. `01_roles_nologin.sql`
2. `02_roles_login.sql`
3. `03_grant_roles.sql`
4. `04_schemas.sql`
5. `05_default_privileges.sql`
6. `06_types.sql`
7. `07_core_plataforma.sql`
8. `08_core_locatarios_usuarios_rbac.sql`
9. `09_core_operacional_base.sql`
10. `10_core_transacoes_estoque_os.sql`
11. `11_audit_tabelas.sql`
12. `12_jobs_tabelas.sql`

## Como executar

Scripts 01 a 04 devem ser executados por `postgres` ou papel com permissão equivalente.

A partir do script 05, use o papel `migracao`, diretamente ou via login `multilocatario_migrador`.

## Regra de ownership

- `posse` é o dono dos objetos.
- `migracao` executa os scripts.
- Ao final de cada script estrutural, os objetos são transferidos para `posse`.
