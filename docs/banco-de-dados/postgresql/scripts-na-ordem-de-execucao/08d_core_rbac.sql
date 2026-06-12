-- ============================================================
-- 01d_core_rbac.sql
-- Etapa: RBAC compartilhado entre locatário e plataforma
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

CREATE TABLE IF NOT EXISTS core.papeis (
  papel_id    UUID NOT NULL DEFAULT gen_random_uuid(),
  codigo      TEXT NOT NULL CHECK (length(trim(codigo)) > 0),
  nome        TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  descricao   TEXT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_papeis PRIMARY KEY (papel_id),
  CONSTRAINT uq_papeis_codigo UNIQUE (codigo)
);

CREATE TABLE IF NOT EXISTS core.permissoes (
  permissao_id UUID NOT NULL DEFAULT gen_random_uuid(),
  codigo       TEXT NOT NULL CHECK (length(trim(codigo)) > 0),
  nome         TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  descricao    TEXT NULL,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_permissoes PRIMARY KEY (permissao_id),
  CONSTRAINT uq_permissoes_codigo UNIQUE (codigo)
);

CREATE TABLE IF NOT EXISTS core.papel_permissoes (
  papel_id      UUID NOT NULL,
  permissao_id  UUID NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_papel_permissoes
    PRIMARY KEY (papel_id, permissao_id)
);

CREATE TABLE IF NOT EXISTS core.usuarios_papeis (
  locatario_id  UUID NOT NULL,
  usuario_id    UUID NOT NULL,
  papel_id      UUID NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_usuarios_papeis
    PRIMARY KEY (locatario_id, usuario_id, papel_id)
);

ALTER TABLE core.papeis OWNER TO posse;
ALTER TABLE core.permissoes OWNER TO posse;
ALTER TABLE core.papel_permissoes OWNER TO posse;
ALTER TABLE core.usuarios_papeis OWNER TO posse;
