CREATE TABLE IF NOT EXISTS itens_importacao (
  id               UUID DEFAULT gen_random_uuid(),
  importacao_id    UUID NOT NULL,
  locatario_id     UUID NOT NULL,
  numero_linha     INTEGER NOT NULL,
  dados_brutos     JSONB NOT NULL, -- conteúdo original da linha (colunas/valores)
  status           status_job NOT NULL DEFAULT 'PENDENTE',
  detalhe_erro     TEXT NULL,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
