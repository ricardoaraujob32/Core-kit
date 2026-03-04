-- PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  produto_id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,
  sku TEXT NULL,
  nome TEXT NOT NULL,
  unidade TEXT NULL DEFAULT 'UN', -- UN, KG, etc
  tipo TEXT NOT NULL CHECK (tipo IN ('PRODUTO','SERVICO')),
  ativo BOOLEAN NOT NULL DEFAULT true,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

ALTER TABLE ADD CONSTRAINT pk_produtos PRIMARY KEY (locatario_id, produto_id);

ALTER TABLE ADD CONSTRAINT uq_produtos_nome UNIQUE (locatario_id, nome);

CREATE UNIQUE INDEX uq_produtos_sku ON produtos(locatario_id, sku) WHERE sku IS NOT NULL;