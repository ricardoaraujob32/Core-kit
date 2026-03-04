CREATE TABLE IF NOT EXISTS ativos_cripto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  moeda_id UUID NOT NULL,
  rede_id UUID NOT NULL,

  -- para tokens (ERC20 etc.), pode existir endereço de contrato
  contrato TEXT NULL,

  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_ativos_cripto_moeda
    FOREIGN KEY (moeda_id) REFERENCES principal.moedas(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ativos_cripto_rede
    FOREIGN KEY (rede_id) REFERENCES principal.redes_cripto(id) ON DELETE RESTRICT,

  -- impede duplicar o mesmo “ativo” na mesma rede
  CONSTRAINT uq_ativo_rede UNIQUE (moeda_id, rede_id, contrato)
);