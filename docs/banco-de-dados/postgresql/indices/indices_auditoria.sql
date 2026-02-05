DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_auditoria') THEN
    ALTER TABLE auditoria
    ADD CONSTRAINT pk_auditoria
    PRIMARY KEY (id, locatario_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_auditoria_locatarios') THEN
    ALTER TABLE auditoria
    ADD CONSTRAINT fk_auditoria_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_auditoria_usuarios') THEN
    ALTER TABLE auditoria
    ADD CONSTRAINT fk_auditoria_usuarios
    FOREIGN KEY (usuario_executor_id)
    REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_auditoria_locatario_criacao ON auditoria(locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_executor_criacao ON auditoria(usuario_executor_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_acao ON auditoria(acao);

CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria(tipo_entidade, entidade_id);
