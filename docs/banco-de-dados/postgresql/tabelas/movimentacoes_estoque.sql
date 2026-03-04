-- MOVIMENTOS (delta pode ser negativo no AJUSTE)
CREATE TABLE IF NOT EXISTS movimentos_estoque (
  movimentacao_id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,  
  estoque_id UUID NOT NULL,
  produto_id UUID NOT NULL,
  transacao_id UUID NOT NULL,
  item_transacao_id UUID NOT NULL,
  
  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA','SAIDA','AJUSTE')),
  delta NUMERIC(18,3) NOT NULL CHECK (delta <> 0), -- +quantidade para ENTRADA, -quantidade para SAIDA, e livre (mas consistente) para AJUSTE
  quantidade NUMERIC(18,3) NOT NULL CHECK (quantidade > 0), -- sempre positiva
  ocorrencia_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  detalhes JSONB NOT NULL DEFAULT '{}'::jsonb, -- informação adicional

  referencia TEXT NULL, -- nro doc, pedido, observação
  observacao TEXT NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID NULL
);

ALTER TABLE movimentos_estoque ADD CONSTRAINT pk_movimentos_estoque PRIMARY KEY (locatario_id, movimentacao_id);

ALTER TABLE movimentos_estoque ADD CONSTRAINT fk_movimentos_estoque_itens_transacao
FOREIGN KEY (locatario_id, estoque_id, produto_id, transacao_id, item_transacao_id)
REFERENCES itens_transacao(locatario_id, estoque_id, produto_id, transacao_id, item_transacao_id)
ON DELETE SET NULL;
 
-- CREATE INDEX IF NOT EXISTS idx_mov_estoque_tempo
-- ON movimentos_estoque(locatario_id, estoque_id, ocorrencia_em DESC);

-- CREATE INDEX IF NOT EXISTS idx_mov_item_tempo
-- ON movimentos_estoque(locatario_id, item_id, ocorrencia_em DESC);
