-- docs/banco-de-dados/postgresql/tabelas/modulos.sql

-- CATÁLOGO GLOBAL DE FUNCIONALIDADES
-- Cada registro representa um módulo funcional do sistema.
--
-- REGRAS:
-- - Módulos são globais (nível plataforma)
-- - NÃO dependem de plano ou locatário
-- - Habilitação ocorre por plano
--
-- EXEMPLOS:
-- - estoque
-- - financeiro
-- - relatorios
CREATE TABLE IF NOT EXISTS core.modulos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      TEXT NOT NULL UNIQUE CHECK (codigo ~ '^[A-Z0-9_]+$'), -- Identificador técnico estável (usado em regras)
  nome        TEXT NOT NULL, -- Nome amigável
  categoria   core.categoria_modulos NOT NULL, 
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  gratuito    BOOLEAN NOT NULL DEFAULT FALSE,
  ordem_exibicao INTEGER NOT NULL DEFAULT 0,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),  
);
