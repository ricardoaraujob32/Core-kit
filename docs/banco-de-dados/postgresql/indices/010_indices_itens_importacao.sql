ALTER TABLE itens_importacao
ADD CONSTRAINT pk_itens_importacao
PRIMARY KEY (id, locatario_id, job_id);

ALTER TABLE itens_importacao
ADD CONSTRAINT fk_itens_importacao_importacoes
FOREIGN KEY (importacao_id, locatario_id)
REFERENCES importacoes(id, locatario_id)
ON UPDATE CASCADE
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_itens_importacao_job
  ON itens_importacao (importacao_id);

CREATE INDEX IF NOT EXISTS idx_itens_importacao_locatario
  ON itens_importacao (locatario_id);

CREATE INDEX IF NOT EXISTS idx_itens_importacao_status
  ON itens_importacao (status);