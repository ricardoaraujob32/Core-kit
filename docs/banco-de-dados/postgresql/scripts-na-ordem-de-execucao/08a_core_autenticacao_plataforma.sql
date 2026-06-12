-- ============================================================
-- 01a_core_autenticacao_plataforma.sql
-- Etapa: tabelas de autenticação da plataforma
--
-- Pré-requisitos:
-- - schemas core/audit/jobs/api já criados
-- - enums já criados
-- - papéis administrativos já criados
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

CREATE TABLE IF NOT EXISTS core.usuarios_plataforma (
  usuario_plataforma_id UUID NOT NULL DEFAULT gen_random_uuid(),
  nome                  TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  email                 TEXT NOT NULL CHECK (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'
  ),
  senha_hash            TEXT NOT NULL CHECK (length(trim(senha_hash)) > 0),
  ativo                 BOOLEAN NOT NULL DEFAULT true,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em           TIMESTAMPTZ NULL,
  excluido_por          UUID NULL,
  excluido_motivo       TEXT NULL,

  CONSTRAINT pk_usuarios_plataforma
    PRIMARY KEY (usuario_plataforma_id),

  CONSTRAINT uq_usuarios_plataforma_email
    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS core.tokens_plataforma (
  token_plataforma_id   UUID NOT NULL DEFAULT gen_random_uuid(),
  usuario_plataforma_id UUID NOT NULL,
  hash_token            TEXT NOT NULL CHECK (length(trim(hash_token)) > 0),
  tipo                  core.tipo_token NOT NULL,
  emitido_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em             TIMESTAMPTZ NOT NULL,
  revogado_em           TIMESTAMPTZ NULL,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_tokens_plataforma
    PRIMARY KEY (token_plataforma_id),

  CONSTRAINT uq_tokens_plataforma_hash
    UNIQUE (hash_token),

  CONSTRAINT ck_tokens_plataforma_expiracao
    CHECK (expira_em > emitido_em),

  CONSTRAINT ck_tokens_plataforma_revogacao
    CHECK (revogado_em IS NULL OR revogado_em >= emitido_em)
);

CREATE TABLE IF NOT EXISTS core.usuarios_papeis_plataforma (
  usuario_plataforma_id UUID NOT NULL,
  papel_id              UUID NOT NULL,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_usuarios_papeis_plataforma
    PRIMARY KEY (usuario_plataforma_id, papel_id)
);

ALTER TABLE core.usuarios_plataforma OWNER TO posse;
ALTER TABLE core.tokens_plataforma OWNER TO posse;
ALTER TABLE core.usuarios_papeis_plataforma OWNER TO posse;
