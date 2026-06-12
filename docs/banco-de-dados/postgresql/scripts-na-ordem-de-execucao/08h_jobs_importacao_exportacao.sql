-- ============================================================
-- 01h_jobs_importacao_exportacao.sql
-- Etapa: jobs, importações e exportações
--
-- Escopo:
-- - CREATE TABLE
-- - PRIMARY KEY
-- - CHECK
-- - UNIQUE estrutural
-- - OWNER TO posse
--
-- Fora do escopo:
-- - FKs
-- - índices
-- - triggers
-- - funções
-- - RLS/policies
-- ============================================================

SET search_path TO jobs, public;

-- ============================================================
-- IMPORTAÇÕES
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs.importacoes (
  importacao_id      UUID NOT NULL DEFAULT gen_random_uuid(),

  locatario_id       UUID NOT NULL,

  tipo_origem        jobs.tipo_origem_importacao NOT NULL,

  arquivo_nome       TEXT NULL,

  status             jobs.status_job NOT NULL DEFAULT 'PENDENTE',

  metadados          JSONB NOT NULL DEFAULT '{}'::jsonb,

  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  iniciado_em        TIMESTAMPTZ NULL,
  finalizado_em      TIMESTAMPTZ NULL,

  erro_codigo        TEXT NULL,
  erro_mensagem      TEXT NULL,

  CONSTRAINT pk_importacoes
    PRIMARY KEY (locatario_id, importacao_id)
);

-- ============================================================
-- ITENS DE IMPORTAÇÃO
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs.itens_importacao (
  item_importacao_id UUID NOT NULL DEFAULT gen_random_uuid(),

  importacao_id      UUID NOT NULL,

  locatario_id       UUID NOT NULL,

  linha              INTEGER NOT NULL
                     CHECK (linha > 0),

  status             jobs.status_job NOT NULL DEFAULT 'PENDENTE',

  dados              JSONB NOT NULL DEFAULT '{}'::jsonb,

  erro_codigo        TEXT NULL,
  erro_mensagem      TEXT NULL,

  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_itens_importacao
    PRIMARY KEY (item_importacao_id)
);

-- ============================================================
-- EXPORTAÇÕES
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs.exportacoes (
  exportacao_id      UUID NOT NULL DEFAULT gen_random_uuid(),

  locatario_id       UUID NOT NULL,

  formato            jobs.formato_exportacao NOT NULL,

  arquivo_nome       TEXT NULL,

  status             jobs.status_job NOT NULL DEFAULT 'PENDENTE',

  metadados          JSONB NOT NULL DEFAULT '{}'::jsonb,

  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  iniciado_em        TIMESTAMPTZ NULL,
  finalizado_em      TIMESTAMPTZ NULL,

  erro_codigo        TEXT NULL,
  erro_mensagem      TEXT NULL,

  CONSTRAINT pk_exportacoes
    PRIMARY KEY (exportacao_id)
);

-- ============================================================
-- OWNERSHIP
-- ============================================================

ALTER TABLE jobs.importacoes OWNER TO posse;
ALTER TABLE jobs.itens_importacao OWNER TO posse;
ALTER TABLE jobs.exportacoes OWNER TO posse;
