-- Tipos (ENUM) - opcional/recomendado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_locatario') THEN
    CREATE TYPE status_locatario AS ENUM ('ATIVO','SUSPENSO','EXCLUIDO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'planos_locatario') THEN
    CREATE TYPE planos_locatario AS ENUM ('GRATUITO','BASICO','PRO','EMPRESARIAL');
  END IF; 

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_usuario') THEN
    CREATE TYPE status_usuario AS ENUM ('ATIVO','BLOQUEADO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_origem_importacao') THEN
    CREATE TYPE tipo_origem_importacao AS ENUM ('CSV', 'XLSX', 'GOOGLE_SHEETS');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_job') THEN
    CREATE TYPE status_job AS ENUM ('PENDENTE', 'EXECUTANDO', 'SUCESSO', 'ERRO', 'CANCELADO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'formato_exportacao') THEN
    CREATE TYPE formato_exportacao AS ENUM ('CSV', 'XLSX', 'PDF');
  END IF;
END $$;
