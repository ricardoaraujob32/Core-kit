-- ============================================================
-- 01e_core_planos_modulos_assinaturas.sql
-- Etapa: planos, módulos e assinaturas
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
-- PLANOS
-- ============================================================

CREATE TABLE IF NOT EXISTS core.planos (
  plano_id             UUID NOT NULL DEFAULT gen_random_uuid(),

  codigo               TEXT NOT NULL
                       CHECK (length(trim(codigo)) > 0),

  nome                 TEXT NOT NULL
                       CHECK (length(trim(nome)) > 0),

  descricao            TEXT NULL,

  tipo_plano           core.planos_locatario NOT NULL DEFAULT 'BASICO',

  ciclo_cobranca       core.ciclo_cobranca NOT NULL DEFAULT 'MENSAL',

  valor_centavos       BIGINT NOT NULL DEFAULT 0
                       CHECK (valor_centavos >= 0),

  ativo                BOOLEAN NOT NULL DEFAULT true,

  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em          TIMESTAMPTZ NULL,
  excluido_por         UUID NULL,
  excluido_motivo      TEXT NULL,

  CONSTRAINT pk_planos
    PRIMARY KEY (plano_id),

  CONSTRAINT uq_planos_codigo
    UNIQUE (codigo)
);

-- ============================================================
-- MÓDULOS
-- ============================================================

CREATE TABLE IF NOT EXISTS core.modulos (
  modulo_id            UUID NOT NULL DEFAULT gen_random_uuid(),

  codigo               TEXT NOT NULL
                       CHECK (length(trim(codigo)) > 0),

  nome                 TEXT NOT NULL
                       CHECK (length(trim(nome)) > 0),

  descricao            TEXT NULL,

  ativo                BOOLEAN NOT NULL DEFAULT true,

  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em          TIMESTAMPTZ NULL,
  excluido_por         UUID NULL,
  excluido_motivo      TEXT NULL,

  CONSTRAINT pk_modulos
    PRIMARY KEY (modulo_id),

  CONSTRAINT uq_modulos_codigo
    UNIQUE (codigo)
);

-- ============================================================
-- RELACIONAMENTO PLANO -> MÓDULO
-- ============================================================

CREATE TABLE IF NOT EXISTS core.modulos_plano (
  plano_id             UUID NOT NULL,

  modulo_id            UUID NOT NULL,

  status               core.status_modulo_assinatura NOT NULL DEFAULT 'ATIVO',

  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_modulos_plano
    PRIMARY KEY (plano_id, modulo_id)
);

-- ============================================================
-- LIMITES DO PLANO
-- ============================================================

CREATE TABLE IF NOT EXISTS core.limites_plano (
  limite_plano_id      UUID NOT NULL DEFAULT gen_random_uuid(),

  plano_id             UUID NOT NULL,

  codigo               TEXT NOT NULL
                       CHECK (length(trim(codigo)) > 0),

  valor                BIGINT NOT NULL
                       CHECK (valor >= 0),

  descricao            TEXT NULL,

  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_limites_plano
    PRIMARY KEY (limite_plano_id),

  CONSTRAINT uq_limites_plano_codigo
    UNIQUE (plano_id, codigo)
);

-- ============================================================
-- MÓDULOS HABILITADOS POR LOCATÁRIO
-- ============================================================

CREATE TABLE IF NOT EXISTS core.modulos_locatario (
  locatario_id         UUID NOT NULL,

  modulo_id            UUID NOT NULL,

  origem               core.origem_modulo_assinatura NOT NULL DEFAULT 'PLANO_SUGERIDO',

  status               core.status_modulo_assinatura NOT NULL DEFAULT 'ATIVO',

  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_modulos_locatario
    PRIMARY KEY (locatario_id, modulo_id)
);

-- ============================================================
-- ASSINATURAS
-- ============================================================

CREATE TABLE IF NOT EXISTS core.assinaturas (
  assinatura_id        UUID NOT NULL DEFAULT gen_random_uuid(),

  locatario_id         UUID NOT NULL,

  plano_id             UUID NOT NULL,

  status               core.status_assinatura NOT NULL DEFAULT 'ATIVA',

  inicio_em            TIMESTAMPTZ NOT NULL DEFAULT now(),

  fim_em               TIMESTAMPTZ NULL,

  renovacao_em         TIMESTAMPTZ NULL,

  motivo               TEXT NULL,

  valor_centavos       BIGINT NOT NULL DEFAULT 0
                       CHECK (valor_centavos >= 0),

  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em          TIMESTAMPTZ NULL,
  excluido_por         UUID NULL,
  excluido_motivo      TEXT NULL,

  CONSTRAINT pk_assinaturas
    PRIMARY KEY (assinatura_id)
);

-- ============================================================
-- OWNERSHIP
-- ============================================================

ALTER TABLE core.planos OWNER TO posse;
ALTER TABLE core.modulos OWNER TO posse;
ALTER TABLE core.modulos_plano OWNER TO posse;
ALTER TABLE core.limites_plano OWNER TO posse;
ALTER TABLE core.modulos_locatario OWNER TO posse;
ALTER TABLE core.assinaturas OWNER TO posse;
