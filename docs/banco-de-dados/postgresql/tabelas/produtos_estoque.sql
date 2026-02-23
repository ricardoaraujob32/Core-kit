-- SALDOS
CREATE TABLE IF NOT EXISTS saldos_estoque (
  locatario_id UUID NOT NULL,
  estoque_id UUID NOT NULL,
  item_id UUID NOT NULL,

  quantidade NUMERIC(18,3) NOT NULL DEFAULT 0,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

-- saldo_atual, custo_medio, estoque_minimo
  

  CONSTRAINT pk_saldos PRIMARY KEY (locatario_id, estoque_id, item_id),
  CONSTRAINT fk_saldos_estoque FOREIGN KEY (locatario_id, estoque_id)
    REFERENCES estoques(locatario_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_saldos_item FOREIGN KEY (locatario_id, item_id)
    REFERENCES itens(locatario_id, id) ON DELETE RESTRICT,
  CONSTRAINT ck_saldos_nao_negativo CHECK (quantidade >= 0)
);

-- MOVIMENTOS (delta pode ser negativo no AJUSTE)
CREATE TABLE IF NOT EXISTS movimentos_estoque (
  locatario_id UUID NOT NULL,
  id UUID NOT NULL DEFAULT gen_random_uuid(),

  estoque_id UUID NOT NULL,
  item_id UUID NOT NULL,
  produto_id UUID NOT NULL,

  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA','SAIDA','AJUSTE')),
  delta NUMERIC(18,3) NOT NULL CHECK (delta <> 0),
  ocorrencia_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  cliente_id UUID NULL,
  fornecedor_id UUID NULL,

  referencia TEXT NULL,
  observacao TEXT NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID NULL,

  CONSTRAINT pk_movimentos PRIMARY KEY (locatario_id, id),
  CONSTRAINT fk_mov_estoque FOREIGN KEY (locatario_id, estoque_id)
    REFERENCES estoques(locatario_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_mov_item FOREIGN KEY (locatario_id, item_id)
    REFERENCES itens(locatario_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_mov_estoque_tempo
ON movimentos_estoque(locatario_id, estoque_id, ocorrencia_em DESC);

CREATE INDEX IF NOT EXISTS idx_mov_item_tempo
ON movimentos_estoque(locatario_id, item_id, ocorrencia_em DESC);

-- SALDOS
CREATE TABLE IF NOT EXISTS saldos_estoque (
  locatario_id UUID NOT NULL,
  estoque_id UUID NOT NULL,
  produto_id UUID NOT NULL,
  quantidade NUMERIC(18,3) NOT NULL DEFAULT 0,

  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_saldos PRIMARY KEY (locatario_id, estoque_id, produto_id),
  CONSTRAINT fk_saldos_estoque FOREIGN KEY (locatario_id, estoque_id)
    REFERENCES estoques(locatario_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_saldos_produto FOREIGN KEY (locatario_id, produto_id)
    REFERENCES produtos(locatario_id, id) ON DELETE RESTRICT,
  CONSTRAINT ck_saldos_qtd_nao_negativa CHECK (quantidade >= 0)
);

-- MOVIMENTOS (razão)
CREATE TABLE IF NOT EXISTS movimentos_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,
  estoque_id UUID NOT NULL,
  produto_id UUID NOT NULL,

  tipo TEXT NOT NULL, -- ENTRADA, SAIDA, AJUSTE
  quantidade NUMERIC(18,3) NOT NULL CHECK (quantidade > 0),
  ocorrencia_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  cliente_id UUID NULL,
  fornecedor_id UUID NULL,
  referencia TEXT NULL, -- nro doc, pedido, observação

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_movimentos PRIMARY KEY (locatario_id, id),

  CONSTRAINT fk_mov_estoque FOREIGN KEY (locatario_id, estoque_id)
    REFERENCES estoques(locatario_id, id) ON DELETE RESTRICT,

  CONSTRAINT fk_mov_produto FOREIGN KEY (locatario_id, produto_id)
    REFERENCES produtos(locatario_id, id) ON DELETE RESTRICT,

  CONSTRAINT fk_mov_cliente FOREIGN KEY (locatario_id, cliente_id)
    REFERENCES clientes(locatario_id, id) ON DELETE SET NULL,

  CONSTRAINT fk_mov_fornecedor FOREIGN KEY (locatario_id, fornecedor_id)
    REFERENCES fornecedores(locatario_id, id) ON DELETE SET NULL,

  CONSTRAINT ck_mov_tipo CHECK (tipo IN ('ENTRADA','SAIDA','AJUSTE')),

  -- regra mínima: entrada costuma ter fornecedor, saída costuma ter cliente (não obriga 100%, mas dá pista)
  CONSTRAINT ck_mov_vinculos CHECK (
    (tipo = 'ENTRADA' AND cliente_id IS NULL)
    OR (tipo = 'SAIDA' AND fornecedor_id IS NULL)
    OR (tipo = 'AJUSTE')
  )
);