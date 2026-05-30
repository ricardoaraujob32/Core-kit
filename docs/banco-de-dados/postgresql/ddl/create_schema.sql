-- db/bootstrap/01_schemas.sql
-- Finalidade: criar schemas do projeto e aplicar bloqueios básicos em public.

-- 1) Travar schema public (boa prática de hardening)
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- 2) Criar schemas do Core Kit
CREATE SCHEMA IF NOT EXISTS core AUTHORIZATION posse;
CREATE SCHEMA IF NOT EXISTS audit AUTHORIZATION posse;
CREATE SCHEMA IF NOT EXISTS jobs AUTHORIZATION posse;
CREATE SCHEMA IF NOT EXISTS api AUTHORIZATION posse;

REVOKE ALL ON SCHEMA public FROM migracao;
GRANT ALL ON SCHEMA core TO migracao;
GRANT ALL ON SCHEMA api TO migracao;
GRANT ALL ON SCHEMA audit TO migracao;
GRANT ALL ON SCHEMA jobs TO migracao;

-- 3) Acesso mínimo para roles (USAGE permite "enxergar" objetos no schema)
GRANT USAGE ON SCHEMA api TO leitura;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT SELECT ON TABLES TO leitura;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT ALL ON FUNCTIONS TO leitura;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT SELECT ON SEQUENCES TO leitura;

GRANT USAGE ON SCHEMA core TO escrita;
ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT UPDATE, DELETE, SELECT, INSERT ON TABLES TO escrita;
ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT ALL ON FUNCTIONS TO escrita;
ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT SELECT ON SEQUENCES TO escrita;

GRANT USAGE ON SCHEMA jobs TO automacao;
ALTER DEFAULT PRIVILEGES IN SCHEMA jobs GRANT INSERT, UPDATE, DELETE, SELECT ON TABLES TO automacao;
ALTER DEFAULT PRIVILEGES IN SCHEMA jobs GRANT ALL ON FUNCTIONS TO automacao;
ALTER DEFAULT PRIVILEGES IN SCHEMA jobs GRANT SELECT ON SEQUENCES TO automacao;








-- Opcional: permitir que o runtime consulte sch_corekit_audit (muitos sistemas mostram trilha no painel admin)
-- GRANT USAGE ON SCHEMA sch_corekit_audit TO corekit_app;
