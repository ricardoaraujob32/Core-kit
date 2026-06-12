-- ============================================================
-- Padrao multilocatario: Roles-modelo (NOLOGIN) reutilizáveis
-- Execute como: postgres (superuser) ou role com CREATEROLE
-- ============================================================

DO $$
BEGIN
  -- 1) administrador (owner lógico): ideal para ser OWNER de schemas/objetos
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_administrador') THEN
    CREATE ROLE multilocatario_administrador LOGIN PASSWORD '1234';
  END IF;

  -- 2) Migrador: usado por migrations (DDL controlado)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_migrador') THEN
    CREATE ROLE multilocatario_migrador LOGIN PASSWORD '1234';
  END IF;

  -- 3) leitor: SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_leitor') THEN
    CREATE ROLE multilocatario_leitor LOGIN PASSWORD '1234';
  END IF;

  -- 4) aplicacao: INSERT/UPDATE/DELETE (geralmente inclui leitura também)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_aplicacao') THEN
    CREATE ROLE multilocatario_aplicacao LOGIN PASSWORD '1234';
  END IF;

  -- 5) Auditor: leitura de trilhas, visões de auditoria, etc
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_auditor') THEN
    CREATE ROLE multilocatario_auditor LOGIN PASSWORD '1234';
  END IF;

  -- 6) Joperador_job: rotinas agendadas/background (ETL, import/export, etc)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_operador_job') THEN
    CREATE ROLE multilocatario_operador_job LOGIN PASSWORD '1234';
  END IF;
END $$;
