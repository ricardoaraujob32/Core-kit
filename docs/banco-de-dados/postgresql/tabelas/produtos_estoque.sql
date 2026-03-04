CREATE TABLE IF NOT EXISTS produtos_estoque (
  locatario_id UUID NOT NULL,
  estoque_id UUID NOT NULL,
  produto_id UUID NOT NULL,

  quantidade NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  saldo_atual NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (saldo_atual >= 0),
  reservado NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (reservado >= 0),
  custo_medio NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (custo_medio >= 0),
  estoque_minimo NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),

  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
);

ALTER TABLE ADD CONSTRAINT pk_saldos PRIMARY KEY (locatario_id, estoque_id, produto_id);

 CONSTRAINT fk_produtos_estoque_estoques FOREIGN KEY (locatario_id, estoque_id)
    REFERENCES estoques(locatario_id, estoque_id) ON DELETE RESTRICT;

  CONSTRAINT fk_produtos_estoque_produtos FOREIGN KEY (locatario_id, produto_id)
    REFERENCES produtos(locatario_id, produto_id) ON DELETE RESTRICT;