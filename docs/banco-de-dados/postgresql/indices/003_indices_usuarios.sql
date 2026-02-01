ALTER TABLE usuarios
ADD CONSTRAINT fk_usuarios_locatarios
FOREIGN KEY (locatario_id)
REFERENCES locatarios(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_email
  ON usuarios(lower(email));

CREATE INDEX IF NOT EXISTS idx_usuarios_locatario
  ON usuarios(locatario_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_status
  ON usuarios(status);
