-- docs/banco-de-dados/postgresql/tabelas/limites_plano.sql

-- LIMITES OPERACIONAIS POR PLANO
-- Controla restrições comerciais/técnicas.
--
-- REGRAS:
-- - Limites pertencem ao plano (não ao locatário)
-- - Valores NULL indicam ausência de limite
-- - Não aplicar cálculos financeiros aqui
--
-- EXEMPLOS:
-- - max_usuarios
-- - max_clientes
CREATE TABLE IF NOT EXISTS limites_plano (
  plano_id       UUID NOT NULL,
  limite_plano_id TEXT NOT NULL CHECK (limite_id ~ '^[A-Z0-9_]+$'),
  valor_inteiro  INTEGER NULL CHECK (valor_inteiro IS NULL OR valor_inteiro >= 0),
  valor_texto    TEXT NULL,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
);

ALTER TABLE ADD CONSTRAINT pk_plano_limites PRIMARY KEY (plano_id, limite_plano_id);

ALTER TABLE ADD CONSTRAINT fk_plano_limites_plano FOREIGN KEY (plano_id)
    REFERENCES planos(plano_id) ON DELETE CASCADE;
