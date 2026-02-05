-- db/bootstrap/02_privileges.sql
-- Finalidade: definir privilégios mínimos e default privileges (essencial para robustez).

-- 1) Banco: remover privilégios amplos do PUBLIC (no banco atual)
-- (Rodar conectado no banco do projeto)
REVOKE ALL ON DATABASE current_database() FROM PUBLIC;

-- 2) Permitir que roles conectem no banco (ajuste se quiser bloquear leitura/auditor por ambiente)
GRANT CONNECT ON DATABASE current_database() TO corekit_migrador, corekit_app, corekit_leitura, corekit_auditor;

-- 3) Permissões em tabelas existentes (caso já existam objetos)
-- APP schema: runtime pode DML, leitura só SELECT
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sch_corekit_app TO corekit_app;
GRANT SELECT ON ALL TABLES IN SCHEMA sch_corekit_app TO corekit_leitura;

-- JOBS schema: runtime pode DML (sch_corekit_jobs de import/export), leitura só SELECT
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sch_corekit_jobs TO corekit_app;
GRANT SELECT ON ALL TABLES IN SCHEMA sch_corekit_jobs TO corekit_leitura;

-- AUDIT schema: auditor pode SELECT (e opcional INSERT se auditar pelo BD)
GRANT SELECT ON ALL TABLES IN SCHEMA sch_corekit_audit TO corekit_auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA sch_corekit_audit TO corekit_leitura;

-- Opcional: permitir a aplicação ler auditoria
-- GRANT SELECT ON ALL TABLES IN SCHEMA sch_corekit_audit TO corekit_app;

-- 4) Sequences (se usar SERIAL/IDENTITY/sequence)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sch_corekit_app TO corekit_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sch_corekit_jobs TO corekit_app;

GRANT SELECT ON ALL SEQUENCES IN SCHEMA sch_corekit_app TO corekit_leitura;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA sch_corekit_jobs TO corekit_leitura;

-- 5) DEFAULT PRIVILEGES — para objetos futuros criados pelo migrador
-- Importante: DEFAULT PRIVILEGES são POR "criador" + schema.
-- Aqui assumimos que migrations rodam como corekit_migrador_dev/hom/prod,
-- e os objetos ficam "criadas por" corekit_migrador (via IN ROLE).
--
-- Dica: rode migrations sempre usando a credencial migradora.

-- Para tabelas novas no schema sch_corekit_app
ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_app
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO corekit_app;

ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_app
  GRANT SELECT ON TABLES TO corekit_leitura;

-- Para sequences novas no schema sch_corekit_app
ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_app
  GRANT USAGE, SELECT ON SEQUENCES TO corekit_app;

ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_app
  GRANT SELECT ON SEQUENCES TO corekit_leitura;

-- Para tabelas novas no schema sch_corekit_jobs
ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_jobs
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO corekit_app;

ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_jobs
  GRANT SELECT ON TABLES TO corekit_leitura;

-- Para sequences novas no schema sch_corekit_jobs
ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_jobs
  GRANT USAGE, SELECT ON SEQUENCES TO corekit_app;

ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_jobs
  GRANT SELECT ON SEQUENCES TO corekit_leitura;

-- Para tabelas novas no schema sch_corekit_audit
ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_audit
  GRANT SELECT ON TABLES TO corekit_auditor;

ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_audit
  GRANT SELECT ON TABLES TO corekit_leitura;

-- Opcional: permitir INSERT em sch_corekit_audit se você decidir auditar via triggers no BD
-- ALTER DEFAULT PRIVILEGES FOR ROLE corekit_migrador IN SCHEMA sch_corekit_audit
--   GRANT INSERT ON TABLES TO corekit_auditor;

-- 6) Hardening opcional: impedir CREATE no schema (somente migrador deve criar)
REVOKE CREATE ON SCHEMA sch_corekit_app FROM PUBLIC;
REVOKE CREATE ON SCHEMA sch_corekit_jobs FROM PUBLIC;
REVOKE CREATE ON SCHEMA sch_corekit_audit FROM PUBLIC;

-- Como o schema é owned pelo corekit_migrador, ele mantém CREATE por ownership.
