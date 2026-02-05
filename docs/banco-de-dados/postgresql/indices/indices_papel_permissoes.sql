DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_papel_permissoes') THEN
    ALTER TABLE papel_permissoes
    ADD CONSTRAINT pk_papel_permissoes
    PRIMARY KEY (papel_id, permissao_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_papel_permissoes_papeis') THEN
    ALTER TABLE papel_permissoes
    ADD CONSTRAINT fk_papel_permissoes_papeis
    FOREIGN KEY (papel_id)
    REFERENCES papeis(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_papel_permissoes_permissoes') THEN
    ALTER TABLE papel_permissoes
    ADD CONSTRAINT fk_papel_permissoes_permissoes
    FOREIGN KEY (permissao_id)
    REFERENCES permissoes(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;
END;
$$;
