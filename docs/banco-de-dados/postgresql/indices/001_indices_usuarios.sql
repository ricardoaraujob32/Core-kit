CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_email
  ON usuarios(lower(email));

CREATE INDEX IF NOT EXISTS idx_usuarios_locatario
  ON usuarios(locatario_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_status
  ON usuarios(status);
