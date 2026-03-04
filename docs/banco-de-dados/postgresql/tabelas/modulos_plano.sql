-- docs/banco-de-dados/postgresql/tabelas/modulos_plano.sql

-- RELAÇÃO PLANO → MÓDULOS
-- Define quais módulos pertencem a cada plano.
--
-- INVARIANTES:
-- - Não deve haver duplicidade (PK composta)
-- - Remove vínculo NÃO remove módulo nem plano
-- - Define capacidades padrão de um plano
CREATE TABLE IF NOT EXISTS modulos_plano (
  plano_id   UUID NOT NULL,
  modulo_id  UUID NOT NULL,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
);

ALTER TABLE ADD CONSTRAINT pk_plano_modulos PRIMARY KEY (plano_id, modulo_id);

ALTER TABLE ADD CONSTRAINT fk_plano_modulos_plano FOREIGN KEY (plano_id)
    REFERENCES app.planos(id) ON DELETE CASCADE;

ALTER TABLE ADD CONSTRAINT fk_plano_modulos_modulo FOREIGN KEY (modulo_id)
    REFERENCES app.modulos(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_plano_modulos_modulo
  ON app.plano_modulos (modulo_id);
