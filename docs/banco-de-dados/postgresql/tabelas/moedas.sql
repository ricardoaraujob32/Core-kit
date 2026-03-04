CREATE TABLE IF NOT EXISTS moedas (
  moeda_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ISO 4217 para fiat (BRL, USD) e símbolo “ticker” para cripto (BTC, USDT)
  codigo TEXT NOT NULL UNIQUE CHECK (codigo ~ '^[A-Z0-9]{2,10}$'),

  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('FIAT','CRIPTO')),

  -- Para fiat: geralmente 2; para cripto varia (BTC=8, ETH=18, etc.)
  casas_decimais SMALLINT NOT NULL CHECK (casas_decimais >= 0 AND casas_decimais <= 30),

  ativo BOOLEAN NOT NULL DEFAULT TRUE,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);