-- =========================================================
-- CORE KIT – PACOTE DE TABELAS (PostgreSQL)
-- Novo modelo:
-- 1) Plano organiza preço base + limites base + módulos sugeridos (catálogo/bundle)
-- 2) Módulos efetivamente habilitados ficam na ASSINATURA do locatário
-- 3) Isso permite addons, cortesias, exceções e promoções sem “gambiarra”
--
-- Observação:
-- Mesmo que “planos” não impacte o sistema atual, é ótimo para:
-- - página de catálogo
-- - segundo sistema/produto
-- - histórico e precificação mais organizada
-- =========================================================



-- =========================================================
-- (A) CATÁLOGO: PLANOS
-- =========================================================
-- ENTIDADE: Plano (catálogo comercial)
-- - Define preço base e informações de vitrine (catálogo)
-- - Sugere módulos (bundle recomendado), mas NÃO é fonte de verdade de acesso
CREATE TABLE IF NOT EXISTS planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  codigo TEXT NOT NULL UNIQUE
    CHECK (codigo ~ '^[A-Z0-9_]+$'), -- Identificador técnico estável p/ integrações

  nome TEXT NOT NULL,
  descricao TEXT NULL,

  ativo BOOLEAN NOT NULL DEFAULT TRUE,

  moeda TEXT NOT NULL DEFAULT 'BRL'
    CHECK (moeda ~ '^[A-Z]{3}$'), -- ISO 4217 (ex.: BRL, USD)

  preco_base_centavos BIGINT NOT NULL DEFAULT 0
    CHECK (preco_base_centavos >= 0),

  ciclo ciclo_cobranca NOT NULL DEFAULT 'MENSAL',

  -- Metadados úteis para catálogo/UI/landing page
  destaque BOOLEAN NOT NULL DEFAULT FALSE,
  ordem INTEGER NOT NULL DEFAULT 0,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planos_ativo ON planos (ativo);
CREATE INDEX IF NOT EXISTS idx_planos_ordem ON planos (ordem);

-- =========================================================
-- (B) CATÁLOGO: MÓDULOS
-- =========================================================
-- ENTIDADE: Módulo (feature/capacidade do produto)
-- - Global, reutilizável
-- - Pode ser usado em diferentes produtos/sistemas
CREATE TABLE IF NOT EXISTS modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  codigo TEXT NOT NULL UNIQUE
    CHECK (codigo ~ '^[a-z0-9_]+$'), -- ex.: estoque, financeiro, relatorios

  nome TEXT NOT NULL,
  descricao TEXT NULL,

  categoria TEXT NOT NULL DEFAULT 'GERAL'
    CHECK (categoria IN ('GERAL','ESTOQUE','FINANCEIRO','RELATORIOS','OPERACOES','INTEGRACOES','ADMIN')),

  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem INTEGER NOT NULL DEFAULT 0,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modulos_categoria ON modulos (categoria);
CREATE INDEX IF NOT EXISTS idx_modulos_ativo ON modulos (ativo);
CREATE INDEX IF NOT EXISTS idx_modulos_ordem ON modulos (ordem);

-- =========================================================
-- (C) PLANO → MÓDULOS SUGERIDOS (bundle/recomendação)
-- =========================================================
-- RELAÇÃO: Plano sugere módulos (p/ catálogo e “bundle padrão”)
-- - NÃO é fonte de verdade de acesso
CREATE TABLE IF NOT EXISTS modulos_sugeridos_plano (
  plano_id UUID NOT NULL,
  modulo_id UUID NOT NULL,

  -- Para UI/catálogo: módulo “incluído no preço” vs apenas “recomendado”
  incluido_no_preco BOOLEAN NOT NULL DEFAULT TRUE,
  sugerido BOOLEAN NOT NULL DEFAULT TRUE,

  ordem INTEGER NOT NULL DEFAULT 0,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (plano_id, modulo_id),

  CONSTRAINT fk_msp_plano
    FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE CASCADE,
  CONSTRAINT fk_msp_modulo
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_msp_plano ON modulos_sugeridos_plano (plano_id);
CREATE INDEX IF NOT EXISTS idx_msp_modulo ON modulos_sugeridos_plano (modulo_id);

-- =========================================================
-- (D) LIMITES BASE DO PLANO (chave-valor)
-- =========================================================
-- LIMITES: base do plano (p/ catálogo e enforcement simples)
-- - Pode ser usado por um “segundo sistema” facilmente
CREATE TABLE IF NOT EXISTS limites_plano (
  plano_id UUID NOT NULL,
  chave TEXT NOT NULL
    CHECK (chave ~ '^[a-z0-9_]+$'), -- ex.: max_usuarios, max_importacoes_mes

  valor_inteiro BIGINT NULL CHECK (valor_inteiro >= 0),
  valor_texto TEXT NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (plano_id, chave),

  CONSTRAINT fk_limites_plano_planos
    FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE CASCADE,

  -- Regra: exatamente um tipo de valor (inteiro OU texto)
  CONSTRAINT ck_limites_plano_valor_unico
    CHECK (
      (valor_inteiro IS NOT NULL AND valor_texto IS NULL) OR
      (valor_inteiro IS NULL AND valor_texto IS NOT NULL)
    )
);

-- =========================================================
-- (E) ASSINATURAS (contrato do locatário)
-- =========================================================
-- ENTIDADE: Assinatura
-- - Fonte de verdade do “contrato” (plano + período + status)
-- - Guarda “snapshot” do preço aplicado naquele contrato
-- - Módulos efetivos ficam em assinatura_modulos
CREATE TABLE IF NOT EXISTS assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  locatario_id UUID NOT NULL,
  plano_id UUID NOT NULL,

  status status_assinatura NOT NULL DEFAULT 'ATIVA',

  inicio_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fim_em TIMESTAMPTZ NULL,          -- encerra/cancela/expira
  renovacao_em TIMESTAMPTZ NULL,    -- opcional (se houver renovação automática)

  -- Snapshot de preço do contrato (não derive do plano em runtime)
  moeda TEXT NOT NULL DEFAULT 'BRL' CHECK (moeda ~ '^[A-Z]{3}$'),
  preco_base_centavos BIGINT NOT NULL DEFAULT 0 CHECK (preco_base_centavos >= 0),
  ciclo ciclo_cobranca NOT NULL DEFAULT 'MENSAL',

  -- Campos opcionais para billing/integrações futuras
  provedor_pagamento TEXT NULL,     -- ex.: stripe, mercadopago
  referencia_externa TEXT NULL,     -- id no provedor

  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ajuste os FKs para sua tabela de locatários real
  CONSTRAINT fk_assinaturas_planos
    FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE RESTRICT
);

-- 1 assinatura ATIVA por locatário (regra de domínio)
CREATE UNIQUE INDEX IF NOT EXISTS uq_assinatura_ativa_por_locatario
  ON principal.assinaturas (locatario_id)
  WHERE status = 'ATIVA';

CREATE INDEX IF NOT EXISTS idx_assinaturas_locatario ON assinaturas (locatario_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas (status);

-- =========================================================
-- (F) MÓDULOS EFETIVOS DO LOCATÁRIO (fonte de verdade)
-- =========================================================
-- ENTIDADE: Assinatura → Módulos (efetivos)
-- - Aqui é onde se decide “o que o locatário tem acesso”
-- - Permite addons, cortesias, exceções e bloqueios por módulo
CREATE TABLE IF NOT EXISTS assinatura_modulos (
  assinatura_id UUID NOT NULL,
  modulo_id UUID NOT NULL,

  status status_modulo_assinatura NOT NULL DEFAULT 'ATIVO',
  origem origem_modulo_assinatura NOT NULL DEFAULT 'PLANO_SUGERIDO',

  -- Opcional: preço adicional do módulo como snapshot (addon/cortesia)
  preco_adicional_centavos BIGINT NULL CHECK (preco_adicional_centavos IS NULL OR preco_adicional_centavos >= 0),

  -- Opcional: vigência específica (promo/cortesia por período)
  vigente_desde_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vigente_ate_em TIMESTAMPTZ NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (assinatura_id, modulo_id),

  CONSTRAINT fk_assinatura_modulos_assinatura
    FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id) ON DELETE CASCADE,
  CONSTRAINT fk_assinatura_modulos_modulo
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_ass_mod_assinatura ON assinatura_modulos (assinatura_id);
CREATE INDEX IF NOT EXISTS idx_ass_mod_modulo ON assinatura_modulos (modulo_id);
CREATE INDEX IF NOT EXISTS idx_ass_mod_status ON assinatura_modulos (status);

-- =========================================================
-- (G) LIMITES ESPECÍFICOS DO CONTRATO (override)
-- =========================================================
-- LIMITES: override do contrato
-- - Permite exceções por cliente (ex.: +10 usuários)
-- - Fonte de verdade: assinatura (não plano)
CREATE TABLE IF NOT EXISTS limites_assinatura (
  assinatura_id UUID NOT NULL,
  chave TEXT NOT NULL CHECK (chave ~ '^[a-z0-9_]+$'),

  valor_inteiro BIGINT NULL CHECK (valor_inteiro >= 0),
  valor_texto TEXT NULL,

  origem TEXT NOT NULL DEFAULT 'OVERRIDE_SUPERADMIN'
    CHECK (origem IN ('PLANO','OVERRIDE_SUPERADMIN','PROMO','CORTESIA')),

  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (assinatura_id, chave),

  CONSTRAINT fk_limites_assinatura_ass
    FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id) ON DELETE CASCADE,

  CONSTRAINT ck_limites_assinatura_valor_unico
    CHECK (
      (valor_inteiro IS NOT NULL AND valor_texto IS NULL) OR
      (valor_inteiro IS NULL AND valor_texto IS NOT NULL)
    )
);

-- =========================================================
-- (H) (Opcional) PREÇOS POR MÓDULO (catálogo de addons)
-- =========================================================
-- Útil se você quer exibir “módulos avulsos” no catálogo e/ou 2º sistema
CREATE TABLE IF NOT EXISTS precos_modulo (
  modulo_id UUID NOT NULL,

  moeda TEXT NOT NULL DEFAULT 'BRL' CHECK (moeda ~ '^[A-Z]{3}$'),
  ciclo ciclo_cobranca NOT NULL DEFAULT 'MENSAL',

  preco_centavos BIGINT NOT NULL CHECK (preco_centavos >= 0),

  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (modulo_id, moeda, ciclo),

  CONSTRAINT fk_precos_modulo_mod
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_precos_modulo_ativo ON precos_modulo (ativo);

-- =========================================================
-- NOTAS DE IMPLEMENTAÇÃO (para seu Mermaid depois)
-- =========================================================
-- 1) Fluxo típico ao criar assinatura:
--    - Criar assinatura (snapshot do preço base do plano)
--    - Inserir módulos sugeridos do plano em assinatura_modulos (origem=PLANO_SUGERIDO)
--    - Adicionar addons/cortesias conforme necessário (origem=ADDON/CORTESIA)
--
-- 2) Regra de acesso:
--    - O locatário tem acesso ao módulo se existir linha em assinatura_modulos
--      com status=ATIVO e vigência válida (vigente_ate_em nulo ou > now()).
--
-- 3) Limites:
--    - Limite efetivo = override em limites_assinatura (se existir) senão limites_plano.
--
-- 4) Catálogo:
--    - planos + modulos_sugeridos_plano + precos_modulo (opcional)
--      permitem montar página de catálogo ou alimentar outro sistema.