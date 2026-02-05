DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_importacoes') THEN
    ALTER TABLE importacoes
    ADD CONSTRAINT pk_importacoes
    PRIMARY KEY (id, locatario_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_importacoes_locatarios') THEN
    ALTER TABLE importacoes
    ADD CONSTRAINT fk_importacoes_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_importacoes_usuarios') THEN
    ALTER TABLE importacoes
    ADD CONSTRAINT fk_importacoes_usuarios
    FOREIGN KEY (criado_por_usuario_id)
    REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_importacao_locatario_criado_em
  ON importacoes(locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_importacao_status
  ON importacoes(status);