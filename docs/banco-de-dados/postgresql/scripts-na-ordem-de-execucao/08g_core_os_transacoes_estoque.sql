-- ============================================================
-- 01g_core_os_transacoes_estoque.sql
-- Etapa: ordens de serviço, transações, itens e movimentações de estoque
--
-- Escopo:
-- - CREATE TABLE
-- - PRIMARY KEY
-- - CHECK
-- - UNIQUE estrutural
-- - OWNER TO posse
--
-- Fora do escopo:
-- - FKs
-- - índices
-- - triggers
-- - funções
-- - RLS/policies
-- ============================================================

SET search_path TO core, public;

-- ============================================================
-- ORDENS DE SERVIÇO
-- ============================================================

CREATE TABLE IF NOT EXISTS core.ordens_servico (
  locatario_id        UUID NOT NULL,
  ordem_servico_id    UUID NOT NULL DEFAULT gen_random_uuid(),

  cliente_id          UUID NULL,

  status              core.status_ordem_servico NOT NULL DEFAULT 'ABERTA',

  titulo              TEXT NOT NULL
                      CHECK (length(trim(titulo)) > 0),

  descricao           TEXT NULL,

  aberta_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  fechada_em          TIMESTAMPTZ NULL,

  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em         TIMESTAMPTZ NULL,
  excluido_por        UUID NULL,
  excluido_motivo     TEXT NULL,

  CONSTRAINT pk_ordens_servico
    PRIMARY KEY (locatario_id, ordem_servico_id)
);

-- ============================================================
-- TRANSAÇÕES
-- ============================================================

CREATE TABLE IF NOT EXISTS core.transacoes (
  locatario_id        UUID NOT NULL,
  transacao_id        UUID NOT NULL DEFAULT gen_random_uuid(),

  cliente_id          UUID NULL,
  fornecedor_id       UUID NULL,
  ordem_servico_id    UUID NULL,

  tipo                core.tipo_transacao NOT NULL DEFAULT 'VENDA',

  status              core.status_transacao NOT NULL DEFAULT 'ABERTA',

  valor               NUMERIC(18,3) NOT NULL DEFAULT 0
                      CHECK (valor >= 0),

  vencimento_em       TIMESTAMPTZ NULL,

  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em         TIMESTAMPTZ NULL,
  excluido_por        UUID NULL,
  excluido_motivo     TEXT NULL,

  CONSTRAINT pk_transacoes
    PRIMARY KEY (locatario_id, transacao_id),

  CONSTRAINT ck_transacoes_xor_cliente_fornecedor
    CHECK (
      NOT (
        cliente_id IS NOT NULL
        AND fornecedor_id IS NOT NULL
      )
    ),

  CONSTRAINT ck_transacoes_tipo_coerente
    CHECK (
      (tipo = 'VENDA' AND fornecedor_id IS NULL)
      OR
      (tipo = 'COMPRA' AND cliente_id IS NULL)
      OR
      (tipo = 'AJUSTE')
    )
);

-- ============================================================
-- ITENS DE TRANSAÇÃO
-- ============================================================

CREATE TABLE IF NOT EXISTS core.itens_transacao (
  locatario_id        UUID NOT NULL,
  item_transacao_id   UUID NOT NULL DEFAULT gen_random_uuid(),

  transacao_id        UUID NOT NULL,
  produto_id          UUID NOT NULL,
  estoque_id          UUID NOT NULL,

  quantidade          NUMERIC(18,3) NOT NULL DEFAULT 1
                      CHECK (quantidade > 0),

  valor_unitario      NUMERIC(18,3) NOT NULL DEFAULT 0
                      CHECK (valor_unitario >= 0),

  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em         TIMESTAMPTZ NULL,
  excluido_por        UUID NULL,
  excluido_motivo     TEXT NULL,

  CONSTRAINT pk_itens_transacao
    PRIMARY KEY (locatario_id, transacao_id, item_transacao_id)
);

-- ============================================================
-- MOVIMENTAÇÕES DE ESTOQUE
-- ============================================================

CREATE TABLE IF NOT EXISTS core.movimentacoes_estoque (
  locatario_id          UUID NOT NULL,
  movimentacao_id       UUID NOT NULL DEFAULT gen_random_uuid(),

  estoque_id            UUID NOT NULL,
  produto_id            UUID NOT NULL,

  transacao_id          UUID NULL,
  item_transacao_id     UUID NULL,

  tipo_movimentacao     core.tipo_movimentacao_estoque NOT NULL,

  quantidade            NUMERIC(18,3) NOT NULL
                        CHECK (quantidade > 0),

  motivo                TEXT NULL,

  metadados             JSONB NOT NULL DEFAULT '{}'::jsonb,

  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_movimentacoes_estoque
    PRIMARY KEY (locatario_id, movimentacao_id)
);

-- ============================================================
-- OWNERSHIP
-- ============================================================

ALTER TABLE core.ordens_servico OWNER TO posse;
ALTER TABLE core.transacoes OWNER TO posse;
ALTER TABLE core.itens_transacao OWNER TO posse;
ALTER TABLE core.movimentacoes_estoque OWNER TO posse;
