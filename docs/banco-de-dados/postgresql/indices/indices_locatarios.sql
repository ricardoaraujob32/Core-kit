-- FK opcional (recomendado) para quem excluiu
-- (se seu usuário também é multi-locatário, a FK simples é suficiente)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_locatarios_excluido_por_usuario') THEN
    ALTER TABLE locatarios
    ADD CONSTRAINT IF NOT EXISTS fk_locatarios_excluido_por_usuario
    FOREIGN KEY (excluido_por_usuario_id)
    REFERENCES usuarios(id)
    ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_locatarios_planos') THEN
    ALTER TABLE locatarios
    ADD CONSTRAINT IF NOT EXISTS fk_locatarios_planos
    FOREIGN KEY (plano_id)
    REFERENCES planos(id)
    ON DELETE RESTRICT;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_locatarios_status
ON locatarios(status);

CREATE INDEX IF NOT EXISTS idx_locatarios_excluido_em
ON app.locatarios (excluido_em);

CREATE INDEX IF NOT EXISTS idx_locatarios_plano
ON app.locatarios (plano_id);
