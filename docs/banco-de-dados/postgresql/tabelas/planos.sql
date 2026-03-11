-- docs/banco-de-dados/postgresql/tabelas/planos.sql

-- CATÁLOGO DE PLANOS DA PLATAFORMA
-- Define agrupamentos de funcionalidades e limites comerciais.
--
-- REGRAS:
-- - Planos são entidades globais (não pertencem a locatários)
-- - Planos NÃO devem ser removidos fisicamente se já utilizados
-- - Alterações impactam múltiplos locatários
--
-- USO:
-- - Associado a locatários via assinaturas
-- - Controla módulos e limites

CREATE TABLE IF NOT EXISTS planos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        TEXT NOT NULL UNIQUE CHECK (codigo ~ '^[A-Z0-9_]+$'),
  nome          TEXT NOT NULL, -- Nome comercial do plano
  ciclo
  descricao_marketing
  ativo         BOOLEAN NOT NULL DEFAULT TRUE, -- Controle administrativo
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
