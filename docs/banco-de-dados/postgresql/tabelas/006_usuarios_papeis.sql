CREATE TABLE IF NOT EXISTS usuarios_papeis (
  usuario_id    UUID NOT NULL,
  locatario_id  UUID NULL,
  papel_id      UUID NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);
