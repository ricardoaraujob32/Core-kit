-- ITENS (produto/serviço)
CREATE TABLE IF NOT EXISTS core.itens_transacao (
  locatario_id UUID NOT NULL,
  item_transacao_id UUID NOT NULL DEFAULT gen_random_uuid(),
  transacao_id UUID NOT NULL,
  produto_id UUID NOT NULL,
  estoque_id UUID NOT NULL,

  valor NUMERIC(18,3) NOT NULL, 

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

ALTER TABLE ADD CONSTRAINT pk_itens_transacao 
PRIMARY KEY (locatario_id, item_transacao_id, transacao_id, produto_id, estoque_id);

