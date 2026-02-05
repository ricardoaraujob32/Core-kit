# Segurança do Banco de Dados — Core Kit (PostgreSQL)

## Objetivo
Este documento define a política de segurança para DDL, schemas e usuários do PostgreSQL no Core Kit,
seguindo Zero Trust e o princípio do menor privilégio.

## Princípios
1. Runtime não executa DDL.
2. Credenciais separadas por função (migrador, runtime, leitura, auditoria).
3. Credenciais separadas por ambiente (dev/hom/prod).
4. Privilégios explícitos: nada “por padrão”.
5. PUBLIC revogado em database e schemas do projeto.
6. Auditoria e rastreabilidade por contexto (app.usuario_id, app.locatario_id, ip, user_agent, correlation_id).

## Schemas
- app: tabelas de domínio da aplicação.
- jobs: tabelas de importação/exportação e execução assíncrona.
- audit: tabelas de auditoria e trilhas.
- public: bloqueado (sem uso no Core Kit).

## Roles
### Roles-base (sem login)
- corekit_migrador: executa migrations (DDL) e controla ownership dos schemas do projeto.
- corekit_app: execução do backend (DML mínimo necessário).
- corekit_leitura: consultas e relatórios (SELECT apenas).
- corekit_auditor: leitura de trilhas (SELECT em audit).

### Logins por ambiente
- corekit_migrador_dev/hom/prod
- corekit_app_dev/hom/prod
- corekit_leitura_dev/hom/prod
- corekit_auditor_dev/hom/prod

## Regras de acesso (alto nível)
- Migrador: CREATE/ALTER/DROP apenas nos schemas do projeto (app/audit/jobs). Não é superuser.
- App: SELECT/INSERT/UPDATE/DELETE apenas em app e jobs. Sem CREATE/ALTER/DROP.
- Leitura: SELECT apenas.
- Auditor: SELECT em audit (e opcional INSERT se auditoria for gerada no banco).

## Default Privileges
As migrations devem garantir que novos objetos já nasçam com os grants corretos. Por isso:
- ALTER DEFAULT PRIVILEGES é obrigatório em app/jobs/audit.

## Zero Trust no runtime
- Cada requisição deve definir o contexto mínimo para auditoria:
  - app.usuario_id, app.locatario_id, app.ip, app.user_agent, app.correlation_id
- O backend jamais reutiliza credenciais de migrador para queries do dia a dia.

## Segredos
- Senhas e strings de conexão não devem estar no repositório.
- Use .env.example e variáveis de ambiente reais fora do Git.
- Rotacione credenciais periodicamente, principalmente em produção.

## Checklist
- [ ] PUBLIC revogado no database e schemas.
- [ ] Runtime sem DDL.
- [ ] Migrations com usuário migrador.
- [ ] Default privileges definidos.
- [ ] Schemas separados (app/audit/jobs).
- [ ] Auditoria populada com contexto.
