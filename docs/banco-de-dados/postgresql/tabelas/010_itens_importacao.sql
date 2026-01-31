CREATE TABLE IF NOT EXISTS itens_importacao (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  job_id           UUID NOT NULL
                   REFERENCES importacoes(id) ON DELETE CASCADE,

  locatario_id     UUID NOT NULL
                   REFERENCES locatarios(id) ON DELETE CASCADE,

  numero_linha     INTEGER NOT NULL,

  dados_brutos     JSONB NOT NULL, -- conteúdo original da linha (colunas/valores)

  status           status_item_importacao NOT NULL DEFAULT 'PENDENTE',

  detalhe_erro     TEXT NULL,

  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_itens_importacao_trabalho
  ON itens_importacao (trabalho_id);

CREATE INDEX IF NOT EXISTS idx_itens_importacao_locatario
  ON itens_importacao (locatario_id);

CREATE INDEX IF NOT EXISTS idx_itens_importacao_status
  ON itens_importacao (status);

