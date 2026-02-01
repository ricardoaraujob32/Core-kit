ALTER TABLE importacoes
ADD CONSTRAINT pk_importacoes
PRIMARY KEY (id, locatario_id);

ALTER TABLE importacoes
ADD CONSTRAINT fk_importacoes_locatarios
FOREIGN KEY (locatario_id)
REFERENCES locatarios(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE importacoes
ADD CONSTRAINT fk_importacoes_usuarios
FOREIGN KEY (criado_por_usuario_id)
REFERENCES usuarios(id)
ON UPDATE CASCADE
ON DELETE SET NULL;


CREATE INDEX IF NOT EXISTS idx_importacao_locatario_criado_em
  ON importacoes(locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_importacao_status
  ON importacoes(status);