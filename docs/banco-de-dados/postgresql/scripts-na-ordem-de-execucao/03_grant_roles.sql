-- ============================================================
-- 03_grant_roles.sql
-- Herança entre papéis.
-- Execute como postgres/superuser ou role com CREATEROLE.
-- ============================================================

GRANT leitura TO escrita;
GRANT leitura TO auditoria;
GRANT leitura TO automacao;

GRANT posse, migracao, escrita, leitura, auditoria, automacao, purgador
TO multilocatario_administrador;

GRANT migracao TO multilocatario_migrador;
GRANT escrita TO multilocatario_aplicacao;
GRANT leitura TO multilocatario_leitor;
GRANT auditoria TO multilocatario_auditor;
GRANT automacao TO multilocatario_operador_job;
