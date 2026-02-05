DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_locatarios') THEN
    ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuarios_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_excluido_por_usuario') THEN
    ALTER TABLE usuarios
    ADD CONSTRAINT IF NOT EXISTS fk_usuarios_excluido_por_usuario
    FOREIGN KEY (excluido_por_usuario_id)
    REFERENCES usuarios(id)
    ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_usuarios_locatario_excluido_em
  ON usuarios(locatario_id, excluido_em);

-- (recomendado) email único por locatário somente para usuários ATIVOS (soft delete friendly)
-- Ajuste o nome da coluna email se for diferente.
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_locatario_email_ativo
  ON usuarios(locatario_id, lower(email))
  WHERE excluido_em IS NULL;

CREATE INDEX IF NOT EXISTS idx_usuarios_locatario
  ON usuarios(locatario_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_status
  ON usuarios(status);
