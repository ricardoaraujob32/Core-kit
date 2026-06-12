-- ============================================================
-- 01c_core_usuarios_locatario_tokens.sql
-- Etapa: autenticação de locatários
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
-- USUÁRIOS DE LOCATÁRIO
-- ============================================================

CREATE TABLE IF NOT EXISTS core.usuarios (
  locatario_id      UUID NOT NULL,

  usuario_id        UUID NOT NULL DEFAULT gen_random_uuid(),

  nome              TEXT NOT NULL
                    CHECK (length(trim(nome)) > 0),

  email             TEXT NOT NULL
                    CHECK (
                      email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'
                    ),

  senha_hash        TEXT NOT NULL
                    CHECK (
                      length(trim(senha_hash)) > 0
                    ),

  status            core.status_usuario NOT NULL DEFAULT 'ATIVO',

  ativo             BOOLEAN NOT NULL DEFAULT true,

  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em       TIMESTAMPTZ NULL,
  excluido_por      UUID NULL,
  excluido_motivo   TEXT NULL,

  CONSTRAINT pk_usuarios
    PRIMARY KEY (locatario_id, usuario_id),

  CONSTRAINT uq_usuarios_email_por_locatario
    UNIQUE (locatario_id, email)
);

-- ============================================================
-- TOKENS DE LOCATÁRIO
-- ============================================================

CREATE TABLE IF NOT EXISTS core.tokens_locatario (
  locatario_id      UUID NOT NULL,

  token_id          UUID NOT NULL DEFAULT gen_random_uuid(),

  usuario_id        UUID NOT NULL,

  hash_token        TEXT NOT NULL
                    CHECK (
                      length(trim(hash_token)) > 0
                    ),

  tipo              core.tipo_token NOT NULL,

  emitido_em        TIMESTAMPTZ NOT NULL DEFAULT now(),

  expira_em         TIMESTAMPTZ NOT NULL,

  revogado_em       TIMESTAMPTZ NULL,

  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_tokens_locatario
    PRIMARY KEY (locatario_id, token_id),

  CONSTRAINT uq_tokens_locatario_hash
    UNIQUE (hash_token),

  CONSTRAINT ck_tokens_locatario_expiracao
    CHECK (expira_em > emitido_em),

  CONSTRAINT ck_tokens_locatario_revogacao
    CHECK (
      revogado_em IS NULL
      OR revogado_em >= emitido_em
    )
);

-- ============================================================
-- OWNERSHIP
-- ============================================================

ALTER TABLE core.usuarios OWNER TO posse;
ALTER TABLE core.tokens_locatario OWNER TO posse;
