-- ============================================================
-- 01b_core_locatarios_configuracoes.sql
-- Etapa: locatários e configurações
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
SET ROLE posse;

SET search_path TO core, public;

-- ============================================================
-- LOCATÁRIOS
-- ============================================================

CREATE TABLE IF NOT EXISTS core.locatarios (
  locatario_id       UUID NOT NULL DEFAULT gen_random_uuid(),
  nome               TEXT NOT NULL
                     CHECK (length(trim(nome)) > 0),

  slug               TEXT NOT NULL
                     CHECK (length(trim(slug)) > 0),

  documento          TEXT NULL,

  email              TEXT NOT NULL
                     CHECK (
                       email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'
                     ),

  fuso_horario       TEXT NOT NULL DEFAULT 'America/Sao_Paulo',

  status             core.status_locatario NOT NULL DEFAULT 'ATIVO',

  excluido_em        TIMESTAMPTZ NULL,
  motivo_exclusao    TEXT NULL,

  suspenso_em        TIMESTAMPTZ NULL,
  motivo_suspensao   TEXT NULL,

  reativado_em       TIMESTAMPTZ NULL,
  motivo_reativacao  TEXT NULL,

  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_locatarios
    PRIMARY KEY (locatario_id),

  CONSTRAINT uq_locatarios_slug
    UNIQUE (slug)
);

-- ============================================================
-- CONFIGURAÇÕES DO LOCATÁRIO
-- ============================================================

CREATE TABLE IF NOT EXISTS core.configuracoes_locatario (
  locatario_id       UUID NOT NULL,

  configuracao_id    UUID NOT NULL DEFAULT gen_random_uuid(),

  modo_tema          TEXT NOT NULL DEFAULT 'SISTEMA'
                     CHECK (
                       modo_tema IN ('CLARO', 'ESCURO', 'SISTEMA')
                     ),

  identidade_visual  TEXT NOT NULL
                     CHECK (
                       length(trim(identidade_visual)) > 0
                     ),

  cor_primaria       TEXT NULL,
  cor_secundaria     TEXT NULL,
  cor_terciaria      TEXT NULL,

  url_logo           TEXT NULL,

  ativa              BOOLEAN NOT NULL DEFAULT false,

  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_configuracoes_locatario
    PRIMARY KEY (locatario_id, configuracao_id)
);

-- ============================================================
-- OWNERSHIP
-- ============================================================

ALTER TABLE core.locatarios OWNER TO posse;
ALTER TABLE core.configuracoes_locatario OWNER TO posse;
