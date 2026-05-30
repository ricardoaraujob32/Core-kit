SET ROLE posse;

SET search_path TO core, public;

DO $$
BEGIN

IF NOT EXISTS (SELECT 1 FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'core'
    AND t.typname = 'status_locatario') THEN
    CREATE TYPE core.status_locatario AS ENUM ('ATIVO','SUSPENSO','EXCLUIDO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'core'
    AND t.typname = 'planos_locatario') THEN
    CREATE TYPE core.planos_locatario AS ENUM ('GRATUITO','BASICO','PRO','EMPRESARIAL');
  END IF; 


  IF NOT EXISTS (SELECT 1 FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'core'
    AND t.typname = 'status_usuario') THEN
    CREATE TYPE core.status_usuario AS ENUM ('ATIVO','BLOQUEADO');
  END IF;

IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'core'
      AND t.typname = 'tipo_transacao'
  ) THEN
    CREATE TYPE core.tipo_transacao AS ENUM ('VENDA', 'COMPRA', 'AJUSTE');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'core'
      AND t.typname = 'tipo_movimentacao_estoque'
  ) THEN
    CREATE TYPE core.tipo_movimentacao_estoque AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'core'
      AND t.typname = 'status_ordem_servico'
  ) THEN
    CREATE TYPE core.status_ordem_servico AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO', 'CONCLUIDA', 'CANCELADA');
  END IF;

-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'core'
    AND t.typname = 'status_assinatura') THEN
    CREATE TYPE core.status_assinatura AS ENUM ('ATIVA','SUSPENSA','CANCELADA','EXPIRADA');
  END IF;

-- =========================================================
-- ENUMs recomendados (mínimos para o pacote)
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'core'
    AND t.typname = 'ciclo_cobranca') THEN
    CREATE TYPE core.ciclo_cobranca AS ENUM ('MENSAL','ANUAL');
  END IF;

-- =========================================================
-- ENUMs recomendados (mínimos para o pacote)
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'core'
    AND t.typname = 'status_modulo_assinatura') THEN
    CREATE TYPE core.status_modulo_assinatura AS ENUM ('ATIVO','SUSPENSO','REMOVIDO');
  END IF;

-- =========================================================
-- ENUMs recomendados (mínimos para o pacote)
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'core'
    AND t.typname = 'origem_modulo_assinatura') THEN
    CREATE TYPE core.origem_modulo_assinatura AS ENUM ('PLANO_SUGERIDO','ADDON','CORTESIA','MANUAL_SUPERADMIN');
  END IF;

-- =========================================================
-- ENUMs recomendados (mínimos para o pacote)
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'core'
    AND t.typname = 'tipo_token') THEN
    CREATE TYPE core.tipo_token AS ENUM ('ACESSO','REFRESH','RECUPERACAO_SENHA','CONFIRMACAO_EMAIL');
  END IF;

IF NOT EXISTS (SELECT 1 FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'core'
    AND t.typname = 'tipo_produto') THEN
    CREATE TYPE core.tipo_produto AS ENUM ('PRODUTO', 'SERVICO');
  END IF;

IF NOT EXISTS (SELECT 1 FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'core'
    AND t.typname = 'status_transacao') THEN
    CREATE TYPE core.status_transacao AS ENUM ('ABERTA', 'EM_PROCESSAMENTO', 'AGUARDANDO_PAGAMENTO', 'ENVIADA', 'CONCLUIDA', 'CANCELADA');
  END IF;







SET search_path TO jobs, public;

 IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_origem_importacao') THEN
    CREATE TYPE jobs.tipo_origem_importacao AS ENUM ('CSV', 'XLSX', 'GOOGLE_SHEETS');
  END IF;


IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'formato_exportacao') THEN
    CREATE TYPE jobs.formato_exportacao AS ENUM ('CSV', 'XLSX', 'PDF');
  END IF;

IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_job') THEN
    CREATE TYPE jobs.status_job AS ENUM ('PENDENTE', 'EXECUTANDO', 'SUCESSO', 'ERRO', 'CANCELADO');
  END IF;

END $$;
