-- =========================================================
-- RELAÇÃO USUÁRIO → PAPÉIS
--
-- Define quais papéis um usuário possui.
--
-- REGRAS:
-- - Papéis determinam permissões efetivas
-- - Não deve haver duplicidade
-- - Remover vínculo NÃO remove usuário nem papel
--
-- MULTI-TENANT:
-- - Regras de acesso devem considerar locatario_id
-- =========================================================
CREATE TABLE IF NOT EXISTS core.usuarios_papeis_plataforma (
  usuario_id          UUID NOT NULL,
  papel_id            UUID NOT NULL,
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE usuarios_plataforma ADD CONSTRAINT pk_usuarios_plataforma PRIMARY KEY (usuario_id, papel_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_papeis_usuarios') THEN
    ALTER TABLE usuarios_papeis
    ADD CONSTRAINT fk_usuarios_papeis_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_papeis_papeis') THEN
    ALTER TABLE usuarios_papeis
    ADD CONSTRAINT fk_usuarios_papeis_papeis
    FOREIGN KEY (papel_id)
    REFERENCES papeis(papel_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;
END;
$$;





-- ============================================================
-- 2) usuarios_plataforma singleton + consistência com usuarios.locatario_id IS NULL
-- ============================================================

CREATE OR REPLACE FUNCTION trg_usuarios_plataforma_singleton_consistencia()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  already_exists boolean;
  is_platform_user_ok boolean;
BEGIN
  -- Singleton: no máximo 1 linha
  SELECT EXISTS (
    SELECT 1 FROM usuarios_plataforma
    WHERE usuario_id <> NEW.usuario_id
  ) INTO already_exists;

  IF already_exists THEN
    RAISE EXCEPTION 'usuarios_plataforma é singleton: já existe um SUPERADMIN cadastrado';
  END IF;

  -- Consistência: usuário deve ter locatario_id IS NULL
  SELECT EXISTS (
    SELECT 1
    FROM usuarios u
    WHERE u.usuario_id = NEW.usuario_id
      AND u.locatario_id IS NULL
      AND u.excluido_em IS NULL
  ) INTO is_platform_user_ok;

  IF NOT is_platform_user_ok THEN
    RAISE EXCEPTION 'usuário de plataforma inválido: o registro em usuarios deve existir, não estar excluído e locatario_id deve ser NULL';
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_usuarios_plataforma_singleton') THEN
    CREATE TRIGGER tg_usuarios_plataforma_singleton
    BEFORE INSERT OR UPDATE ON usuarios_plataforma
    FOR EACH ROW
    EXECUTE FUNCTION trg_usuarios_plataforma_singleton_consistencia();
  END IF;
END;
$$;
