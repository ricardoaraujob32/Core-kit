-- =========================================================
-- PAPÉIS (ROLES) DO SISTEMA RBAC
--
-- Representa agrupamentos de permissões.
-- NÃO contém regras de negócio diretamente.
--
-- REGRAS:
-- - Papéis são globais (não pertencem a locatários)
-- - Papéis NÃO devem ser removidos fisicamente se já atribuídos
-- - Alterações impactam múltiplos usuários
--
-- EXEMPLOS:
-- - ADMIN
-- - OPERADOR
-- - SUPERADMIN
-- =========================================================
CREATE TABLE IF NOT EXISTS papeis (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        TEXT NOT NULL UNIQUE, -- Identificador técnico estável
  nome          TEXT NOT NULL,  -- Nome amigável exibido em UI
  descricao     TEXT NULL, -- Documentação humana / UI / auditoria
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 0) Seed de papéis mínimos (se ainda não existirem)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM papeis WHERE nome = 'SUPERADMIN') THEN
    INSERT INTO papeis (id, nome, descricao, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), 'SUPERADMIN', 'Acesso total à plataforma (singleton).', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM papeis WHERE nome = 'ADMIN') THEN
    INSERT INTO papeis (id, nome, descricao, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), 'ADMIN', 'Administrador do locatário (no máximo 1 por locatário).', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM papeis WHERE nome = 'GERENTE') THEN
    INSERT INTO papeis (id, nome, descricao, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), 'GERENTE', 'Gerente do locatário.', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM papeis WHERE nome = 'OPERADOR') THEN
    INSERT INTO papeis (id, nome, descricao, criado_em, atualizado_em)
    VALUES (gen_random_uuid(), 'OPERADOR', 'Operador do locatário.', now(), now());
  END IF;
END;
$$;





-- ============================================================
-- Proteção de papéis canônicos (não renomear / não deletar)
-- ============================================================

CREATE OR REPLACE FUNCTION trg_papeis_proteger_canonicos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Bloqueia DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.nome IN ('SUPERADMIN','ADMIN','GERENTE','OPERADOR') THEN
      RAISE EXCEPTION 'papel canônico não pode ser removido: %', OLD.nome;
    END IF;
    RETURN OLD;
  END IF;

  -- Bloqueia renomear (UPDATE nome)
  IF TG_OP = 'UPDATE' THEN
    IF OLD.nome IN ('SUPERADMIN','ADMIN','GERENTE','OPERADOR')
       AND NEW.nome IS DISTINCT FROM OLD.nome THEN
      RAISE EXCEPTION 'papel canônico não pode ser renomeado: %', OLD.nome;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_papeis_proteger_canonicos') THEN
    CREATE TRIGGER tg_papeis_proteger_canonicos
    BEFORE UPDATE OR DELETE ON papeis
    FOR EACH ROW
    EXECUTE FUNCTION trg_papeis_proteger_canonicos();
  END IF;
END;
$$;

-- (Opcional) Se você quiser impedir duplicatas por casing: "Admin" vs "ADMIN"
-- Requer que a coluna nome seja tratada case-insensitive:
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_papeis_nome_lower ON papeis (lower(nome));

