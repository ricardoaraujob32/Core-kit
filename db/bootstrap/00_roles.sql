-- db/bootstrap/00_roles.sql
-- Finalidade: criar roles e usuários (logins) com menor privilégio.
-- Observação: NÃO armazenar senhas no repositório.

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

-- 2) Usuários (logins) por ambiente — cada um herda uma role-base.
-- Você pode criar apenas DEV agora e adicionar HOM/PROD depois.

DO $$
BEGIN
  -- DEV
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_migrador_dev') THEN
    CREATE ROLE corekit_migrador_dev LOGIN IN ROLE corekit_migrador;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_app_dev') THEN
    CREATE ROLE corekit_app_dev LOGIN IN ROLE corekit_app;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_leitura_dev') THEN
    CREATE ROLE corekit_leitura_dev LOGIN IN ROLE corekit_leitura;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_auditor_dev') THEN
    CREATE ROLE corekit_auditor_dev LOGIN IN ROLE corekit_auditor;
  END IF;

  -- HOM (opcional agora)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_migrador_hom') THEN
    CREATE ROLE corekit_migrador_hom LOGIN IN ROLE corekit_migrador;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_app_hom') THEN
    CREATE ROLE corekit_app_hom LOGIN IN ROLE corekit_app;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_leitura_hom') THEN
    CREATE ROLE corekit_leitura_hom LOGIN IN ROLE corekit_leitura;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_auditor_hom') THEN
    CREATE ROLE corekit_auditor_hom LOGIN IN ROLE corekit_auditor;
  END IF;

  -- PROD (opcional agora)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_migrador_prod') THEN
    CREATE ROLE corekit_migrador_prod LOGIN IN ROLE corekit_migrador;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_app_prod') THEN
    CREATE ROLE corekit_app_prod LOGIN IN ROLE corekit_app;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_leitura_prod') THEN
    CREATE ROLE corekit_leitura_prod LOGIN IN ROLE corekit_leitura;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'corekit_auditor_prod') THEN
    CREATE ROLE corekit_auditor_prod LOGIN IN ROLE corekit_auditor;
  END IF;
END $$;

-- 3) Recomendações de segurança (aplicar fora do Git, manualmente):
-- ALTER ROLE corekit_app_dev PASSWORD '...';
-- ALTER ROLE corekit_migrador_dev PASSWORD '...';
-- e assim por diante.
--
-- Em PROD, prefira: senhas longas + rotacionadas, e se possível autenticação gerenciada.
