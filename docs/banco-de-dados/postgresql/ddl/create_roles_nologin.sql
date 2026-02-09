-- ============================================================
-- Padrao CoreKit: Roles-modelo (NOLOGIN) reutilizáveis
-- Execute como: postgres (superuser) ou role com CREATEROLE
-- ============================================================

DO $$
BEGIN
  -- 1) posse (owner lógico): ideal para ser OWNER de schemas/objetos
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'posse') THEN
    CREATE ROLE posse NOLOGIN;
  END IF;

  -- 2) migração: usado por migrations (DDL controlado)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'migracao') THEN
    CREATE ROLE migracao NOLOGIN;
  END IF;

  -- 3) Leitura: SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'leitura') THEN
    CREATE ROLE leitura NOLOGIN;
  END IF;

  -- 4) Escrita: INSERT/UPDATE/DELETE (geralmente inclui leitura também)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'escrita') THEN
    CREATE ROLE escrita NOLOGIN;
  END IF;

  -- 5) auditoria: leitura de trilhas, visões de auditoria, etc
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'auditoria') THEN
    CREATE ROLE auditoria NOLOGIN;
  END IF;

  -- 6) automacao: rotinas agendadas/background (ETL, import/export, etc)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'automacao') THEN
    CREATE ROLE automacao NOLOGIN;
  END IF;
END $$;
