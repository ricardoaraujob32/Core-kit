-- ============================================================
-- 02_roles_login.sql
-- Papéis LOGIN do ambiente.
-- Ajuste senhas por variável/secret em ambiente real.
-- Execute como postgres/superuser ou role com CREATEROLE.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_administrador') THEN
    CREATE ROLE multilocatario_administrador LOGIN PASSWORD '1234';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_migrador') THEN
    CREATE ROLE multilocatario_migrador LOGIN PASSWORD '1234';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_aplicacao') THEN
    CREATE ROLE multilocatario_aplicacao LOGIN PASSWORD '1234';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_leitor') THEN
    CREATE ROLE multilocatario_leitor LOGIN PASSWORD '1234';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_auditor') THEN
    CREATE ROLE multilocatario_auditor LOGIN PASSWORD '1234';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_operador_job') THEN
    CREATE ROLE multilocatario_operador_job LOGIN PASSWORD '1234';
  END IF;
END $$;
