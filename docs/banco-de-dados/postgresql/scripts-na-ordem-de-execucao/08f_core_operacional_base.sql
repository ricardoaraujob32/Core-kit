-- ============================================================
-- 01f_core_operacional_base.sql
-- Etapa: cadastros operacionais base
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

SET search_path TO core, public;

-- ============================================================
-- CLIENTES
-- ============================================================

CREATE TABLE IF NOT EXISTS core.clientes (
  locatario_id     UUID NOT NULL,

  cliente_id       UUID NOT NULL DEFAULT gen_random_uuid(),

  nome             TEXT NOT NULL
                   CHECK (length(trim(nome)) > 0),

  documento        TEXT NULL,

  email            TEXT NULL
                   CHECK (
                     email IS NULL
                     OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'
                   ),

  telefone         TEXT NULL,

  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em      TIMESTAMPTZ NULL,
  excluido_por     UUID NULL,
  excluido_motivo  TEXT NULL,

  CONSTRAINT pk_clientes
    PRIMARY KEY (locatario_id, cliente_id)
);

-- ============================================================
-- FORNECEDORES
-- ============================================================

CREATE TABLE IF NOT EXISTS core.fornecedores (
  locatario_id     UUID NOT NULL,

  fornecedor_id    UUID NOT NULL DEFAULT gen_random_uuid(),

  nome             TEXT NOT NULL
                   CHECK (length(trim(nome)) > 0),

  documento        TEXT NULL,

  email            TEXT NULL
                   CHECK (
                     email IS NULL
                     OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'
                   ),

  telefone         TEXT NULL,

  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em      TIMESTAMPTZ NULL,
  excluido_por     UUID NULL,
  excluido_motivo  TEXT NULL,

  CONSTRAINT pk_fornecedores
    PRIMARY KEY (locatario_id, fornecedor_id)
);

-- ============================================================
-- ESTOQUES
-- ============================================================

CREATE TABLE IF NOT EXISTS core.estoques (
  locatario_id     UUID NOT NULL,

  estoque_id       UUID NOT NULL DEFAULT gen_random_uuid(),

  nome             TEXT NOT NULL
                   CHECK (length(trim(nome)) > 0),

  padrao           BOOLEAN NOT NULL DEFAULT false,

  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em      TIMESTAMPTZ NULL,
  excluido_por     UUID NULL,
  excluido_motivo  TEXT NULL,

  CONSTRAINT pk_estoques
    PRIMARY KEY (locatario_id, estoque_id)
);

-- ============================================================
-- PRODUTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS core.produtos (
  locatario_id       UUID NOT NULL,

  produto_id         UUID NOT NULL DEFAULT gen_random_uuid(),

  tipo               core.tipo_produto NOT NULL DEFAULT 'PRODUTO',

  controla_estoque   BOOLEAN NOT NULL DEFAULT true,

  sku                TEXT NULL,

  nome               TEXT NOT NULL
                     CHECK (length(trim(nome)) > 0),

  unidade            TEXT NOT NULL DEFAULT 'UN'
                     CHECK (length(trim(unidade)) > 0),

  valor              NUMERIC(18,3) NOT NULL DEFAULT 0
                     CHECK (valor >= 0),

  ativo              BOOLEAN NOT NULL DEFAULT true,

  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em        TIMESTAMPTZ NULL,
  excluido_por       UUID NULL,
  excluido_motivo    TEXT NULL,

  CONSTRAINT pk_produtos
    PRIMARY KEY (locatario_id, produto_id),

  CONSTRAINT ck_produtos_servico_sem_estoque
    CHECK (
      (tipo = 'SERVICO' AND controla_estoque = false)
      OR tipo = 'PRODUTO'
    )
);

-- ============================================================
-- OWNERSHIP
-- ============================================================

ALTER TABLE core.clientes OWNER TO posse;
ALTER TABLE core.fornecedores OWNER TO posse;
ALTER TABLE core.estoques OWNER TO posse;
ALTER TABLE core.produtos OWNER TO posse;
