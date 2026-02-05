DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_configuracoes_locatario') THEN
    ALTER TABLE configuracoes_locatario
    ADD CONSTRAINT pk_configuracoes_locatario
    PRIMARY KEY (locatario_id, configuracao_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_configuracoes_locatario_locatarios') THEN
    ALTER TABLE configuracoes_locatario
    ADD CONSTRAINT fk_configuracoes_locatario_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;
END;
$$;
