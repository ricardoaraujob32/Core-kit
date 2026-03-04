CREATE TABLE IF NOT EXISTS principal.precos_plano (
  plano_id UUID NOT NULL,
  moeda_id UUID NOT NULL,

  ciclo ciclo_cobranca NOT NULL DEFAULT 'MENSAL',
  preco_centavos BIGINT NOT NULL CHECK (preco_centavos >= 0),

  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (plano_id, moeda_id, ciclo),

  CONSTRAINT fk_precos_plano_plano
    FOREIGN KEY (plano_id) REFERENCES principal.planos(id) ON DELETE CASCADE,
  CONSTRAINT fk_precos_plano_moeda
    FOREIGN KEY (moeda_id) REFERENCES principal.moedas(id) ON DELETE RESTRICT
);