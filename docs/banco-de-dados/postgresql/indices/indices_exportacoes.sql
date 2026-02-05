DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_exportacoes') THEN
    ALTER TABLE exportacoes
    ADD CONSTRAINT pk_exportacoes
    PRIMARY KEY (id, locatario_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_exportacoes_locatarios') THEN
    ALTER TABLE exportacoes
    ADD CONSTRAINT fk_exportacoes_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_exportacoes_usuarios') THEN
    ALTER TABLE exportacoes
    ADD CONSTRAINT fk_exportacoes_usuarios
    FOREIGN KEY (criado_por_usuario_id)
    REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_exportacoes_locatario_criado_em
  ON exportacoes (locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_exportacoes_status
  ON exportacoes (status);
  