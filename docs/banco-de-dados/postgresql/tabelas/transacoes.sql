CREATE TABLE IF NOT EXISTS core.transacoes (
  transacao_id UUID DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,
  cliente_id UUID NULL,
  fornecedor_id UUID NULL,
  ordem_servico_id UUID NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('VENDA','COMPRA')),
  origem TEXT NOT NULL CHECK (origem IN ('AVULSA','ORDEM_SERVICO')),
  valor_subtotal numeric(18, 3) NULL,
  valor_desconto numeric(18, 3) NULL,
  valor_acrescimo numeric(18, 3) NULL,
  valor_total NUMERIC(18,3) NOT NULL,
  observacao varchar NULL,
  vencimento_em TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ABERTA', 'EM_PROCESSAMENTO', 'AGUARDANDO_PAGAMENTO', 'ENVIADA', 'CONCLUIDA')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL,
  cancelado_em timestamptz NULL,
  cancelado_por uuid NULL,
  cancelado_motivo varchar NULL
);

ALTER TABLE transacoes ADD CONSTRAINT pk_transacao PRIMARY KEY (locatario_id, transacao_id);
