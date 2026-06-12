CREATE TABLE IF NOT EXISTS core.itens_importacao (
  item_id          UUID DEFAULT gen_random_uuid(),
  importacao_id    UUID NOT NULL,
  locatario_id     UUID NOT NULL,
  numero_linha     INTEGER NOT NULL,
  dados_brutos     JSONB NOT NULL, -- conteúdo original da linha (colunas/valores)
  status           jobs.status_job NOT NULL DEFAULT 'PENDENTE',
  detalhe_erro     TEXT NULL,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_itens_importacao') THEN
    ALTER TABLE itens_importacao
    ADD CONSTRAINT pk_itens_importacao
    PRIMARY KEY (id, locatario_id, job_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_itens_importacao_importacoes') THEN
    ALTER TABLE itens_importacao
    ADD CONSTRAINT fk_itens_importacao_importacoes
    FOREIGN KEY (importacao_id, locatario_id)
    REFERENCES importacoes(id, locatario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_itens_importacao_job
  ON itens_importacao (importacao_id);

CREATE INDEX IF NOT EXISTS idx_itens_importacao_locatario
  ON itens_importacao (locatario_id);

CREATE INDEX IF NOT EXISTS idx_itens_importacao_status
  ON itens_importacao (status);
  
