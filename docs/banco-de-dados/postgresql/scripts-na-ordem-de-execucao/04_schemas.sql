-- ============================================================
-- 04_schemas.sql
-- Schemas oficiais.
-- Execute como postgres/superuser ou role com CREATE no database.
-- ============================================================

REVOKE ALL ON SCHEMA public FROM PUBLIC;

CREATE SCHEMA IF NOT EXISTS core AUTHORIZATION posse;
CREATE SCHEMA IF NOT EXISTS audit AUTHORIZATION posse;
CREATE SCHEMA IF NOT EXISTS jobs AUTHORIZATION posse;
CREATE SCHEMA IF NOT EXISTS api AUTHORIZATION posse;

GRANT USAGE, CREATE ON SCHEMA core TO migracao;
GRANT USAGE, CREATE ON SCHEMA audit TO migracao;
GRANT USAGE, CREATE ON SCHEMA jobs TO migracao;
GRANT USAGE, CREATE ON SCHEMA api TO migracao;

GRANT USAGE ON SCHEMA core TO leitura, escrita, automacao;
GRANT USAGE ON SCHEMA audit TO auditoria, leitura;
GRANT USAGE ON SCHEMA jobs TO automacao;
GRANT USAGE ON SCHEMA api TO leitura, escrita;

REVOKE CREATE ON SCHEMA core FROM PUBLIC;
REVOKE CREATE ON SCHEMA audit FROM PUBLIC;
REVOKE CREATE ON SCHEMA jobs FROM PUBLIC;
REVOKE CREATE ON SCHEMA api FROM PUBLIC;
