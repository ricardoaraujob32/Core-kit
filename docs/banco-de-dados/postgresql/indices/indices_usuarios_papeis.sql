DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_usuarios_papeis') THEN
    ALTER TABLE usuarios_papeis
    ADD CONSTRAINT pk_usuarios_papeis
    PRIMARY KEY (usuario_id, locatario_id, papel_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_papeis_locatarios') THEN
    ALTER TABLE usuarios_papeis
    ADD CONSTRAINT fk_usuarios_papeis_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_papeis_usuarios') THEN
    ALTER TABLE usuarios_papeis
    ADD CONSTRAINT fk_usuarios_papeis_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_papeis_papeis') THEN
    ALTER TABLE usuarios_papeis
    ADD CONSTRAINT fk_usuarios_papeis_papeis
    FOREIGN KEY (papel_id)
    REFERENCES papeis(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;
END;
$$;
