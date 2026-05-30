-- docs/banco-de-dados/postgresql/tabelas/locatarios.sql

-- ENTIDADE CENTRAL DO SISTEMA MULTI-TENANT
-- Representa uma empresa/cliente isolado logicamente na plataforma.
--
-- REGRAS DE NEGÓCIO IMPORTANTES:
-- - Um locatário é uma entidade forte (vida própria)
-- - NÃO depende de usuários ou sessões
-- - Pode existir mesmo sem assinatura ativa
-- - Suspensão altera apenas o status, nunca remove dados
-- - Exclusão é sempre lógica (soft delete)
--
-- IDENTIDADE:
-- - slug é único globalmente
-- - slug é usado em URLs/subdomínios
-- - slug NÃO deve ser alterado após criação
--
-- CONSISTÊNCIA:
-- - Se excluido_em estiver preenchido, o locatário é considerado inativo
-- - status controla acesso ao sistema (ATIVO/SUSPENSO/etc)
--
-- NÃO CONFUNDIR COM:
-- - Usuários
-- - Assinaturas
-- - Planos

CREATE TABLE IF NOT EXISTS core.locatarios (
  locatario_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                       TEXT NOT NULL, -- Nome comercial exibido no sistema
  slug                       TEXT NOT NULL, -- Identidade externa estável (subdomínio / URL pública)
  documento                  TEXT NULL,  -- CNPJ, CPF, etc
  email                      TEXT NOT NULL CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'),
  fuso_horario               TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  status                     core.status_locatario NOT NULL DEFAULT 'ATIVO', -- Controla acesso do tenant, NÃO é soft delete
  excluido_em                TIMESTAMPTZ NULL, -- Exclusão lógica; registros nunca são removidos fisicamente
  motivo_exclusao            TEXT NULL, -- Motivo administrativo para exclusão, se aplicável
  suspenso_em                TIMESTAMPTZ NULL, -- Suspensão; bloqueia autenticação/uso, mas preserva tudo
  motivo_suspensao           TEXT NULL, -- Motivo administrativo para suspensão, se aplicável
  reativado_em               TIMESTAMPTZ NULL, -- Reativação; muda o status para ATIVO
  motivo_reativacao          TEXT NULL, -- Motivo administrativo para reativação, se aplicável
  criado_em                  TIMESTAMPTZ NOT NULL DEFAULT now(), -- para auditoria
  atualizado_em              TIMESTAMPTZ NOT NULL DEFAULT now() -- atualizado por trigger
);

-- FK opcional (recomendado) para quem excluiu
-- (se seu usuário também é multi-locatário, a FK simples é suficiente)
-- DO $$
-- BEGIN
  
-- END;
-- $$;

CREATE INDEX IF NOT EXISTS idx_locatarios_status_ativos
ON core.locatarios (status)
WHERE excluido_em IS NULL;

CREATE INDEX IF NOT EXISTS idx_locatarios_excluidos
ON core.locatarios (excluido_em)
WHERE excluido_em IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_locatarios_slug_ci
ON core.locatarios (lower(slug));





-- Máscara/validação do slug (regex) + tamanho
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_locatarios_slug_mascara') THEN
    ALTER TABLE core.locatarios
      ADD CONSTRAINT ck_locatarios_slug_mascara
      CHECK (
        length(slug) BETWEEN 3 AND 63
        AND slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      );
  END IF;
END;
$$;

-- ============================================================
-- P2: Consistência de ciclo de vida + bloqueio de alteração do slug
-- - slug sempre normalizado (lower + trim)
-- - slug não pode ser alterado após criação
-- - Se suspenso_em estiver preenchido, status deve ser "SUSPENSO" (se existir no enum),
--   senão pelo menos não pode ser "ATIVO"
-- - Se excluido_em estiver preenchido, status deve ser "EXCLUIDO" (se existir no enum),
--   senão pelo menos não pode ser "ATIVO"
-- - Reativação não pode ocorrer se excluído (excluido_em não pode estar preenchido)
-- - Se status=ATIVO, suspenso_em deve ser NULL
-- ============================================================
CREATE OR REPLACE FUNCTION trg_locatarios_p2_consistencia()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  has_suspenso boolean;
  has_excluido boolean;
BEGIN
  -- normalização de slug
  NEW.slug := lower(trim(NEW.slug));

  -- máscara (defensiva; o CHECK também cobre)
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    RAISE EXCEPTION 'slug é obrigatório';
  END IF;

  IF length(NEW.slug) < 3 OR length(NEW.slug) > 63 OR NEW.slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'slug inválido: use 3..63 chars, [a-z0-9] e hífen, sem espaços (ex: minha-loja-01)';
  END IF;

  -- slug imutável após criação
  IF TG_OP = 'UPDATE' AND NEW.slug IS DISTINCT FROM OLD.slug THEN
    RAISE EXCEPTION 'slug não pode ser alterado após criação';
  END IF;

  -- enum labels opcionais (evita quebrar caso o enum não tenha as labels)
  SELECT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'status_locatario' AND e.enumlabel = 'SUSPENSO'
  ) INTO has_suspenso;

  SELECT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'status_locatario' AND e.enumlabel = 'EXCLUIDO'
  ) INTO has_excluido;

  -- reativação: não pode se estiver excluído
  IF NEW.reativado_em IS NOT NULL AND NEW.excluido_em IS NOT NULL THEN
    RAISE EXCEPTION 'não é permitido reativar um locatário excluído (excluido_em preenchido)';
  END IF;

  -- se reativado_em foi preenchido: força ATIVO e limpa suspensão
  IF NEW.reativado_em IS NOT NULL THEN
    NEW.status := 'ATIVO';
    NEW.suspenso_em := NULL;
    NEW.motivo_suspensao := NULL;
  END IF;

  -- exclusão lógica implica "não ativo"
  IF NEW.excluido_em IS NOT NULL THEN
    IF has_excluido THEN
      NEW.status := 'EXCLUIDO';
    ELSE
      IF NEW.status = 'ATIVO' THEN
        RAISE EXCEPTION 'locatário excluído não pode permanecer com status ATIVO';
      END IF;
    END IF;
  END IF;

  -- suspensão implica "não ativo"
  IF NEW.suspenso_em IS NOT NULL AND NEW.excluido_em IS NULL THEN
    IF has_suspenso THEN
      NEW.status := 'SUSPENSO';
    ELSE
      IF NEW.status = 'ATIVO' THEN
        RAISE EXCEPTION 'locatário suspenso não pode permanecer com status ATIVO';
      END IF;
    END IF;
  END IF;

  -- status ATIVO implica não suspenso
  IF NEW.status = 'ATIVO' THEN
    NEW.suspenso_em := NULL;
    NEW.motivo_suspensao := NULL;
  END IF;

  -- se status SUSPENSO e suspenso_em não veio preenchido, preenche automaticamente (se label existir)
  IF has_suspenso AND NEW.status = 'SUSPENSO' AND NEW.suspenso_em IS NULL THEN
    NEW.suspenso_em := now();
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_locatarios_p2') THEN
    CREATE TRIGGER tg_locatarios_p2
    BEFORE INSERT OR UPDATE ON locatarios
    FOR EACH ROW
    EXECUTE FUNCTION trg_locatarios_p2_consistencia();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_locatarios_set_atualizado_em') THEN
    CREATE TRIGGER tg_locatarios_set_atualizado_em
    BEFORE INSERT OR UPDATE ON locatarios
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_atualizado_em();
  END IF;
END;
$$;
