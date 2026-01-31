CREATE TABLE IF NOT EXISTS usuarios_papeis (
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  locatario_id  UUID NULL REFERENCES locatarios(id) ON DELETE CASCADE,
  papel_id      UUID NOT NULL REFERENCES papeis(id) ON DELETE CASCADE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, locatario_id, papel_id)
);
