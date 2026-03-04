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
CREATE TABLE IF NOT EXISTS usuarios_papeis (
  usuario_id          UUID NOT NULL,
  locatario_id        UUID NOT NULL, -- NULL indica usuário de nível plataforma (ex.: superadmin)
  papel_id            UUID NOT NULL,
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE usuarios_papeis ADD CONSTRAINT pk_usuarios_papeis PRIMARY KEY (locatario_id, usuario_id, papel_id); 

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_papeis_locatarios') THEN
    ALTER TABLE usuarios_papeis
    ADD CONSTRAINT fk_usuarios_papeis_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(locatario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

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
-- 3.1) no máximo 1 ADMIN por locatário (trigger em usuarios_papeis)
-- ============================================================

CREATE OR REPLACE FUNCTION trg_usuarios_papeis_max_um_admin_por_locatario()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  admin_papel_id uuid;
  admin_conflict boolean;
BEGIN
  -- Descobre o ID do papel ADMIN (canônico por nome)
  SELECT id INTO admin_papel_id
  FROM papeis
  WHERE nome = 'ADMIN'
  LIMIT 1;

  IF admin_papel_id IS NULL THEN
    RAISE EXCEPTION 'papel canônico ADMIN não existe em papeis; crie-o antes de aplicar a regra';
  END IF;

  -- Só valida se a operação envolve ADMIN
  IF NEW.papel_id <> admin_papel_id THEN
    RETURN NEW;
  END IF;

  -- Regra: no máximo 1 usuário diferente com ADMIN no mesmo locatário
  SELECT EXISTS (
    SELECT 1
    FROM usuarios_papeis up
    WHERE up.locatario_id = NEW.locatario_id
      AND up.papel_id = admin_papel_id
      AND up.usuario_id <> NEW.usuario_id
  ) INTO admin_conflict;

  IF admin_conflict THEN
    RAISE EXCEPTION 'regra violada: já existe um ADMIN para este locatário (no máximo 1)';
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_usuarios_papeis_max_um_admin') THEN
    CREATE TRIGGER tg_usuarios_papeis_max_um_admin
    BEFORE INSERT OR UPDATE ON usuarios_papeis
    FOR EACH ROW
    EXECUTE FUNCTION trg_usuarios_papeis_max_um_admin_por_locatario();
  END IF;
END;
$$;