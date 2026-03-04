CREATE TABLE IF NOT EXISTS principal.carteiras_cripto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  ativo_cripto_id UUID NOT NULL,

  -- endereço (ou equivalente) de recebimento
  endereco TEXT NOT NULL,

  -- rótulo para organização (ex.: "Carteira principal", "Cold storage")
  rotulo TEXT NOT NULL,

  -- alguns protocolos exigem “memo/tag” (ex.: XRP, XLM, etc.)
  memo_tag TEXT NULL,

  ativa BOOLEAN NOT NULL DEFAULT TRUE,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_carteiras_cripto_ativo
    FOREIGN KEY (ativo_cripto_id) REFERENCES principal.ativos_cripto(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_carteiras_cripto_ativa ON principal.carteiras_cripto (ativa);