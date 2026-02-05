CREATE TABLE IF NOT EXISTS usuarios (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locatario_id               UUID NULL,
  email                      TEXT NOT NULL,
  nome                       TEXT NOT NULL,
  senha_hash                 TEXT NOT NULL,
  status                     status_usuario NOT NULL DEFAULT 'ATIVO',
  administrador              BOOLEAN NOT NULL DEFAULT FALSE,
  ultimo_login_em            TIMESTAMPTZ NULL,
  criado_em                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em              TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em                TIMESTAMPTZ NULL,
  excluido_por_usuario_id    UUID NULL,
  motivo_exclusao            TEXT NULL;
);
