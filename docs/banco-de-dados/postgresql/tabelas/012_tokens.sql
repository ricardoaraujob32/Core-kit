CREATE TABLE IF NOT EXISTS tokens (
  id                 UUID DEFAULT gen_random_uuid(),
  usuario_id         UUID NOT NULL,
  locatario_id       UUID NULL,
  hash_token         TEXT NOT NULL, -- nunca guarde o token em claro
  emitido_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em          TIMESTAMPTZ NOT NULL,
  revogado_em        TIMESTAMPTZ NULL,
  proximo_token_id   UUID NULL, -- id do novo token (rotação)
  agente_usuario     TEXT NULL,
  endereco_ip        TEXT NULL
);
