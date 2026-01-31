CREATE TABLE IF NOT EXISTS tokens_atualizacao (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  usuario_id        UUID NOT NULL
                    REFERENCES usuarios(id) ON DELETE CASCADE,

  locatario_id      UUID NULL
                    REFERENCES locatarios(id) ON DELETE CASCADE,

  hash_token        TEXT NOT NULL, -- nunca guarde o token em claro

  emitido_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em         TIMESTAMPTZ NOT NULL,

  revogado_em       TIMESTAMPTZ NULL,

  substituido_por_id UUID NULL, -- id do novo token (rotação)

  agente_usuario    TEXT NULL,
  endereco_ip       TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_tokens_atualizacao_usuario
  ON tokens_atualizacao (usuario_id);

CREATE INDEX IF NOT EXISTS idx_tokens_atualizacao_expira_em
  ON tokens_atualizacao (expira_em);

CREATE INDEX IF NOT EXISTS idx_tokens_atualizacao_locatario
  ON tokens_atualizacao (locatario_id);

