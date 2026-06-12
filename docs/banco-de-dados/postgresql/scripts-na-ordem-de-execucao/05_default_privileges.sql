-- ============================================================
-- 05_default_privileges.sql
-- Privilégios padrão para objetos criados por migracao.
-- Execute como papel migracao ou como administrador usando SET ROLE migracao.
-- ============================================================

ALTER DEFAULT PRIVILEGES FOR ROLE migracao IN SCHEMA core
  GRANT SELECT ON TABLES TO leitura;

ALTER DEFAULT PRIVILEGES FOR ROLE migracao IN SCHEMA core
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO escrita;

ALTER DEFAULT PRIVILEGES FOR ROLE migracao IN SCHEMA audit
  GRANT SELECT ON TABLES TO auditoria;

ALTER DEFAULT PRIVILEGES FOR ROLE migracao IN SCHEMA audit
  GRANT SELECT ON TABLES TO leitura;

ALTER DEFAULT PRIVILEGES FOR ROLE migracao IN SCHEMA jobs
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO automacao;

ALTER DEFAULT PRIVILEGES FOR ROLE migracao IN SCHEMA api
  GRANT SELECT ON TABLES TO leitura;

ALTER DEFAULT PRIVILEGES FOR ROLE migracao IN SCHEMA api
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO escrita;
