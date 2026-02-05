-- db/bootstrap/01_schemas.sql
-- Finalidade: criar schemas do projeto e aplicar bloqueios básicos em public.

-- 1) Travar schema public (boa prática de hardening)
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- 2) Criar schemas do Core Kit
CREATE SCHEMA IF NOT EXISTS sch_corekit_app AUTHORIZATION corekit_migrador;
CREATE SCHEMA IF NOT EXISTS sch_corekit_audit AUTHORIZATION corekit_migrador;
CREATE SCHEMA IF NOT EXISTS sch_corekit_jobs AUTHORIZATION corekit_migrador;

-- 3) Acesso mínimo para roles (USAGE permite "enxergar" objetos no schema)
GRANT USAGE ON SCHEMA sch_corekit_app TO corekit_app, corekit_leitura;
GRANT USAGE ON SCHEMA sch_corekit_audit TO corekit_auditor, corekit_leitura;
GRANT USAGE ON SCHEMA sch_corekit_jobs TO corekit_app, corekit_leitura;

-- Opcional: permitir que o runtime consulte sch_corekit_audit (muitos sistemas mostram trilha no painel admin)
-- GRANT USAGE ON SCHEMA sch_corekit_audit TO corekit_app;
