-- =========================================================
-- TOKENS DE AUTENTICAÇÃO / SESSÃO
--
-- Representa tokens emitidos pelo sistema de autenticação.
--
-- REGRAS CRÍTICAS DE SEGURANÇA:
-- - Tokens podem ser revogados
-- - Tokens possuem validade temporal
-- - NÃO confiar apenas em expiração do JWT
-- - Nunca armazenar tokens sensíveis em texto puro
-- - NÃO Armazenar JWT puro
-- - NÃO Confiar apenas em expiração
-- - NÃO Permitir múltiplos refresh tokens ativos sem controle
--
-- USO:
-- - Controle de sessão
-- - Rotação / revogação
-- =========================================================
CREATE TABLE IF NOT EXISTS tokens (
  token_id           UUID NOT NULL DEFAULT gen_random_uuid(),
  usuario_id         UUID NOT NULL,
  locatario_id       UUID NULL, -- NULL indica usuário de nível plataforma (ex.: superadmin)
  hash_token         TEXT UNIQUE NOT NULL, -- nunca guarde o token em claro
  tipo               tipo_token NOT NULL, -- access / refresh / etc.
  emitido_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em          TIMESTAMPTZ NOT NULL,
  revogado_em        TIMESTAMPTZ NULL,
  proximo_token_id   UUID NULL, -- id do novo token (rotação)
  proximo_usuario_id UUID NULL,
  agente_usuario     TEXT NULL,
  endereco_ip        INET NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_token') THEN
    ALTER TABLE tokens ADD CONSTRAINT pk_token PRIMARY KEY (token_id, usuario_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proximo_token_id') THEN
    ALTER TABLE tokens
    ADD CONSTRAINT fk_proximo_token_id
    FOREIGN KEY (proximo_token_id, proximo_usuario_id)
    REFERENCES tokens(token_id, usuario_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tokens_usuarios') THEN
    ALTER TABLE tokens
    ADD CONSTRAINT fk_tokens_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tokens_atualizacao_locatarios') THEN
    ALTER TABLE tokens
    ADD CONSTRAINT fk_tokens_atualizacao_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(locatario_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_tokens_usuario
  ON tokens(usuario_id);

CREATE INDEX IF NOT EXISTS idx_tokens_expira_em
  ON tokens(expira_em);

CREATE INDEX IF NOT EXISTS idx_tokens_locatario
  ON tokens(locatario_id);

-- 2) Constraints de consistência temporal
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_tokens_expira_maior_emitido') THEN
    ALTER TABLE tokens
    ADD CONSTRAINT ck_tokens_expira_maior_emitido
    CHECK (expira_em > emitido_em);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_tokens_revogado_coerente') THEN
    ALTER TABLE tokens
    ADD CONSTRAINT ck_tokens_revogado_coerente
    CHECK (revogado_em IS NULL OR revogado_em >= emitido_em);
  END IF;
END;
$$;

-- 4) Índices auxiliares recomendados (performance)
CREATE INDEX IF NOT EXISTS idx_tokens_usuario_locatario_status
ON tokens (usuario_id, locatario_id, revogado_em, expira_em);

CREATE INDEX IF NOT EXISTS idx_tokens_expira_em
ON tokens (expira_em);

CREATE INDEX IF NOT EXISTS idx_tokens_proximo
ON tokens (proximo_token_id, proximo_usuario_id);

-- 5) RLS estrita (tenant-scoped): requer contexto app_locatario_id definido
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='tokens' AND policyname='p_tokens_tenant_estrito'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_tokens_tenant_estrito
      ON tokens
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (locatario_id = app_locatario_id())
      WITH CHECK (locatario_id = app_locatario_id())
    $sql$;
  END IF;
END;
$$;

-- ============================================================
-- DELTA TOKENS COERÊNCIA USUÁRIO x LOCATÁRIO (v6)
-- Objetivo: impedir tokens com locatario_id diferente do locatario_id do usuário
-- Regra:
-- - Usuário comum (usuarios.locatario_id IS NOT NULL): tokens.locatario_id deve ser igual
-- - Usuário de plataforma (usuarios.locatario_id IS NULL): permitido tokens com locatario_id (quando atuando em tenant)
--   e também permitido NULL (se você emitir token puramente de plataforma; opcional)
-- ============================================================

CREATE OR REPLACE FUNCTION trg_tokens_validar_locatario_do_usuario()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  user_locatario uuid;
BEGIN
  SELECT u.locatario_id INTO user_locatario
  FROM usuarios u
  WHERE u.usuario_id = NEW.usuario_id
    AND u.excluido_em IS NULL;

  IF user_locatario IS NULL THEN
    -- Usuário de plataforma (SUPERADMIN): pode emitir token para um tenant (locatario_id preenchido),
    -- ou eventualmente um token de plataforma (locatario_id NULL), se você permitir.
    RETURN NEW;
  END IF;

  -- Usuário comum: token deve ser do mesmo locatário do usuário
  IF NEW.locatario_id IS NULL THEN
    RAISE EXCEPTION 'token inválido: usuário comum exige locatario_id (tenant)';
  END IF;

  IF NEW.locatario_id <> user_locatario THEN
    RAISE EXCEPTION 'token inválido: locatario_id do token (%) difere do locatario_id do usuário (%)',
      NEW.locatario_id, user_locatario;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_tokens_validar_locatario_do_usuario') THEN
    CREATE TRIGGER tg_tokens_validar_locatario_do_usuario
    BEFORE INSERT OR UPDATE ON tokens
    FOR EACH ROW
    EXECUTE FUNCTION trg_tokens_validar_locatario_do_usuario();
  END IF;
END;
$$;