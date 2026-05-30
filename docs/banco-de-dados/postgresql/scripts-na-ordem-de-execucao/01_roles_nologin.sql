-- ============================================================
-- 01_roles_nologin.sql
-- Papéis modelo (NOLOGIN)
-- Execute como postgres/superuser ou role com CREATEROLE.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'posse') THEN
    CREATE ROLE posse NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'migracao') THEN
    CREATE ROLE migracao NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'leitura') THEN
    CREATE ROLE leitura NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'escrita') THEN
    CREATE ROLE escrita NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'auditoria') THEN
    CREATE ROLE auditoria NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'automacao') THEN
    CREATE ROLE automacao NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'purgador') THEN
    CREATE ROLE purgador NOLOGIN;
  END IF;
END $$;
