-- PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,
  sku TEXT NULL,
  nome TEXT NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'UN', -- UN, KG, etc
  ativo BOOLEAN NOT NULL DEFAULT true,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL,

  CONSTRAINT pk_produtos PRIMARY KEY (locatario_id, id),
  CONSTRAINT uq_produtos_nome UNIQUE (locatario_id, nome),
  CONSTRAINT uq_produtos_sku UNIQUE (locatario_id, sku)
);

-- ITENS (produto/serviço)
CREATE TABLE IF NOT EXISTS itens (
  locatario_id UUID NOT NULL,
  id UUID NOT NULL DEFAULT gen_random_uuid(),

  tipo_item TEXT NOT NULL CHECK (tipo_item IN ('PRODUTO','SERVICO')),
  sku TEXT NULL,
  nome TEXT NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'UN',
  ativo BOOLEAN NOT NULL DEFAULT true,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL,

  CONSTRAINT pk_itens PRIMARY KEY (locatario_id, id),
  CONSTRAINT uq_itens_nome UNIQUE (locatario_id, nome),
  CONSTRAINT uq_itens_sku UNIQUE (locatario_id, sku)
);