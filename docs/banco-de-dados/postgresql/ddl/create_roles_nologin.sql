-- 1) Roles-base (sem login) — permissões são atribuídas aqui.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_migrador') THEN
    CREATE ROLE corekit_migrador NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_app') THEN
    CREATE ROLE corekit_app NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_leitura') THEN
    CREATE ROLE corekit_leitura NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_auditor') THEN
    CREATE ROLE corekit_auditor NOLOGIN;
  END IF;
END $$;