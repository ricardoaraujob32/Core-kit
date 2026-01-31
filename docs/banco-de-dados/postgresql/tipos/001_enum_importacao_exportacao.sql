-- Tipos (ENUM) - opcional/recomendado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_origem_importacao') THEN
    CREATE TYPE tipo_origem_importacao AS ENUM ('CSV', 'XLSX', 'GOOGLE_SHEETS');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_trabalho') THEN
    CREATE TYPE status_trabalho AS ENUM ('PENDENTE', 'EM_EXECUCAO', 'CONCLUIDO', 'FALHOU', 'CANCELADO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_item_importacao') THEN
    CREATE TYPE status_item_importacao AS ENUM ('PENDENTE', 'IMPORTADO', 'ERRO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'formato_exportacao') THEN
    CREATE TYPE formato_exportacao AS ENUM ('CSV', 'XLSX', 'PDF');
  END IF;
END $$;

