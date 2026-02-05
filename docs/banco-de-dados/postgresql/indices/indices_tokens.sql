DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_token') THEN
    ALTER TABLE tokens
    ADD CONSTRAINT pk_token
    PRIMARY KEY (id, usuario_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proximo_token_id') THEN
    ALTER TABLE tokens
    ADD CONSTRAINT fk_proximo_token_id
    FOREIGN KEY (proximo_token_id ,usuario_id)
    REFERENCES tokens(id, usuario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tokens_usuarios') THEN
    ALTER TABLE tokens
    ADD CONSTRAINT fk_tokens_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tokens_atualizacao_locatarios') THEN
    ALTER TABLE tokens
    ADD CONSTRAINT fk_tokens_atualizacao_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_tokens_usuario
  ON tokens(usuario_id);

CREATE INDEX IF NOT EXISTS idx_tokens_expira_em
  ON tokens(expira_em);

CREATE INDEX IF NOT EXISTS idx_tokens_locatario
  ON tokens(locatario_id);
