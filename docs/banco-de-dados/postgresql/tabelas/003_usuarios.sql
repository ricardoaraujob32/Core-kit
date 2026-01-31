CREATE TABLE IF NOT EXISTS usuarios (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locatario_id      UUID NULL REFERENCES locatarios(id) ON DELETE SET NULL,
  email             TEXT NOT NULL,
  nome              TEXT NOT NULL,
  senha_hash        TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'ATIVO'
                    CHECK (status IN ('ATIVO','BLOQUEADO')),
  administrador     BOOLEAN NOT NULL DEFAULT FALSE,
  ultimo_login_em   TIMESTAMPTZ NULL,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em       TIMESTAMPTZ NULL
);



