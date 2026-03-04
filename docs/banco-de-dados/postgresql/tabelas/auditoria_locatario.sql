CREATE TABLE IF NOT EXISTS auditoria_locatario (
  auditoria_id         UUID DEFAULT gen_random_uuid(),
  locatario_id         UUID NOT NULL,
  usuario_id           UUID NOT NULL,
  evento               TEXT NOT NULL, -- evento gerado
  sucesso              BOOLEAN NOT NULL,
  erro_codigo          TEXT NULL,
  erro_mensagem        TEXT NULL,
  entidade_nome        TEXT NULL,
  entidade_tipo        TEXT NULL, -- nome da entidade/DTO/tabela
  entidade_id          TEXT NULL, -- id/chave primária da entidade. Se composta, usar padrão: {entidade:chave}{entidade:chave}
  origem               TEXT NULL,
  requisicao_id        TEXT NULL,
  endereco_ip          INET NULL, 
  agente_usuario       TEXT NULL,
  agente_tipo          TEXT NULL,
  metadados            JSONB NOT NULL DEFAULT '{}'::jsonb, -- informação adicional, tudo que não tiver campo próprio
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- padronização para metadados
-- {
--   "antes": {...},
--   "depois": {...},
--   "contexto": {"rota": "...", "user_agent": "..."},
--   "origem": "api|job|admin",
--   "motivo": "..."
-- }

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_auditoria') THEN
    ALTER TABLE auditoria ADD CONSTRAINT pk_auditoria PRIMARY KEY (auditoria_id, locatario_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_auditoria_locatarios') THEN
    ALTER TABLE auditoria
    ADD CONSTRAINT fk_auditoria_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(locatario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_auditoria_usuarios') THEN
    ALTER TABLE auditoria
    ADD CONSTRAINT fk_auditoria_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_auditoria_locatario_criacao ON auditoria(locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_executor_criacao ON auditoria(usuario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_acao ON auditoria(acao);

CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria(tipo_entidade, entidade_id);

-- ============================================================
-- AUDITORIA (v7) - SQL CORRIGIDO + P1/P2/P3
-- P1) Imutabilidade: bloquear UPDATE/DELETE
-- P2) Índices essenciais
-- P3) Coerência com contexto (app_*), incluindo separação:
--     - auditoria_locatario: somente contexto tenant (app_is_plataforma=false, app_locatario_id definido)
--     - auditoria_plataforma: somente plataforma (app_is_plataforma=true), podendo ter locatario_alvo_id = app_locatario_id()
-- ============================================================





-- ============================================================
-- 2) CONSTRAINTS / FKs
-- ============================================================

DO $$
BEGIN
  -- auditoria_locatario PK
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_auditoria_locatario') THEN
    ALTER TABLE auditoria_locatario
    ADD CONSTRAINT pk_auditoria_locatario
    PRIMARY KEY (auditoria_id, locatario_id);
  END IF;

  -- auditoria_plataforma PK
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_auditoria_plataforma') THEN
    ALTER TABLE auditoria_plataforma
    ADD CONSTRAINT pk_auditoria_plataforma
    PRIMARY KEY (auditoria_id);
  END IF;

  -- FKs auditoria_locatario
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_auditoria_locatario_locatarios') THEN
    ALTER TABLE auditoria_locatario
    ADD CONSTRAINT fk_auditoria_locatario_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(locatario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_auditoria_locatario_usuarios') THEN
    ALTER TABLE auditoria_locatario
    ADD CONSTRAINT fk_auditoria_locatario_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
  END IF;

  -- FKs auditoria_plataforma
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_auditoria_plataforma_usuarios') THEN
    ALTER TABLE auditoria_plataforma
    ADD CONSTRAINT fk_auditoria_plataforma_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_auditoria_plataforma_locatario_alvo') THEN
    ALTER TABLE auditoria_plataforma
    ADD CONSTRAINT fk_auditoria_plataforma_locatario_alvo
    FOREIGN KEY (locatario_alvo_id)
    REFERENCES locatarios(locatario_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;
END;
$$;

-- ============================================================
-- 3) P2 - ÍNDICES ESSENCIAIS
-- ============================================================

-- auditoria_locatario
CREATE INDEX IF NOT EXISTS idx_auditoria_locatario_locatario_criado_em
ON auditoria_locatario (locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_locatario_entidade
ON auditoria_locatario (locatario_id, entidade_tipo, entidade_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_locatario_usuario
ON auditoria_locatario (locatario_id, usuario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_locatario_requisicao
ON auditoria_locatario (locatario_id, requisicao_id);

CREATE INDEX IF NOT EXISTS idx_auditoria_locatario_evento
ON auditoria_locatario (locatario_id, evento, criado_em DESC);

-- auditoria_plataforma
CREATE INDEX IF NOT EXISTS idx_auditoria_plataforma_criado_em
ON auditoria_plataforma (criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_plataforma_locatario_alvo
ON auditoria_plataforma (locatario_alvo_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_plataforma_usuario
ON auditoria_plataforma (usuario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_plataforma_requisicao
ON auditoria_plataforma (requisicao_id);

CREATE INDEX IF NOT EXISTS idx_auditoria_plataforma_evento
ON auditoria_plataforma (evento, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_plataforma_entidade
ON auditoria_plataforma (entidade_tipo, entidade_id, criado_em DESC);

-- ============================================================
-- 4) P1 - IMUTABILIDADE (bloqueia UPDATE/DELETE)
-- ============================================================

CREATE OR REPLACE FUNCTION trg_auditoria_bloquear_update_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'auditoria é append-only: UPDATE/DELETE não permitido (%)', TG_TABLE_NAME;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_auditoria_locatario_immut') THEN
    CREATE TRIGGER tg_auditoria_locatario_immut
    BEFORE UPDATE OR DELETE ON auditoria_locatario
    FOR EACH ROW
    EXECUTE FUNCTION trg_auditoria_bloquear_update_delete();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_auditoria_plataforma_immut') THEN
    CREATE TRIGGER tg_auditoria_plataforma_immut
    BEFORE UPDATE OR DELETE ON auditoria_plataforma
    FOR EACH ROW
    EXECUTE FUNCTION trg_auditoria_bloquear_update_delete();
  END IF;
END;
$$;

-- ============================================================
-- 5) P3 - COERÊNCIA COM CONTEXTO (app_*)
-- ============================================================

-- Auditoria do locatário só pode ser escrita em modo tenant (não-plataforma) e com locatário definido,
-- e deve bater: locatario_id = app_locatario_id() e usuario_id = app_usuario_id().
CREATE OR REPLACE FUNCTION trg_auditoria_locatario_validar_contexto()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  ctx_locatario uuid;
  ctx_usuario uuid;
BEGIN
  ctx_locatario := app_locatario_id();
  ctx_usuario := app_usuario_id();

  IF app_is_plataforma() THEN
    RAISE EXCEPTION 'auditoria_locatario não aceita modo plataforma; use auditoria_plataforma';
  END IF;

  IF ctx_locatario IS NULL THEN
    RAISE EXCEPTION 'auditoria_locatario exige app_locatario_id() definido';
  END IF;

  IF NEW.locatario_id <> ctx_locatario THEN
    RAISE EXCEPTION 'locatario_id da auditoria (%) difere do contexto (%)', NEW.locatario_id, ctx_locatario;
  END IF;

  IF ctx_usuario IS NOT NULL AND NEW.usuario_id <> ctx_usuario THEN
    RAISE EXCEPTION 'usuario_id da auditoria (%) difere do contexto (%)', NEW.usuario_id, ctx_usuario;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_auditoria_locatario_contexto') THEN
    CREATE TRIGGER tg_auditoria_locatario_contexto
    BEFORE INSERT ON auditoria_locatario
    FOR EACH ROW
    EXECUTE FUNCTION trg_auditoria_locatario_validar_contexto();
  END IF;
END;
$$;

-- ============================================================
-- 6) RLS / POLICIES
-- ============================================================

-- auditoria_locatario: tenant-scoped estrito
ALTER TABLE auditoria_locatario ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='auditoria_locatario' AND policyname='p_auditoria_locatario_tenant_estrito'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_auditoria_locatario_tenant_estrito
      ON auditoria_locatario
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (locatario_id = app_locatario_id())
      WITH CHECK (locatario_id = app_locatario_id())
    $sql$;
  END IF;
END;
$$;




-- ============================================================
-- AUDITORIA (v8) - EXPURGO CONTROLADO (Opção 1 aprovada)
-- Objetivo: manter auditoria append-only para aplicação, mas permitir DELETE para job de expurgo
-- Estratégia:
-- - Criar role NOLOGIN: multilocatario_purgador
-- - Trigger de imutabilidade permite DELETE apenas quando current_user = multilocatario_purgador
-- - UPDATE continua proibido para todos
-- Observação: o job deve executar `SET LOCAL ROLE multilocatario_purgador;` dentro da transação.
-- ============================================================

-- 1) Role de expurgo (NOLOGIN)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_purgador') THEN
    CREATE ROLE multilocatario_purgador NOLOGIN;
  END IF;
END;
$$;

-- 2) Permissões mínimas (ajuste conforme sua estratégia de grants)
-- A role purgadora precisa deletar e ler para filtrar por data.
GRANT SELECT, DELETE ON auditoria_locatario TO multilocatario_purgador;
GRANT SELECT, DELETE ON auditoria_plataforma TO multilocatario_purgador;

-- 3) Trigger de imutabilidade com exceção controlada para DELETE
CREATE OR REPLACE FUNCTION trg_auditoria_bloquear_update_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- UPDATE nunca é permitido
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'auditoria é append-only: UPDATE não permitido (%)', TG_TABLE_NAME;
  END IF;

  -- DELETE permitido somente para o purgador
  IF TG_OP = 'DELETE' THEN
    IF current_user = 'multilocatario_purgador' THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'auditoria é append-only: DELETE permitido apenas para multilocatario_purgador (%)', TG_TABLE_NAME;
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Recriar triggers para garantir uso da nova função
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_auditoria_plataforma_immut') THEN
    EXECUTE 'DROP TRIGGER tg_auditoria_plataforma_immut ON auditoria_plataforma';
  END IF;

  EXECUTE '
    CREATE TRIGGER tg_auditoria_plataforma_immut
    BEFORE UPDATE OR DELETE ON auditoria_plataforma
    FOR EACH ROW
    EXECUTE FUNCTION trg_auditoria_bloquear_update_delete()
  ';
END;
$$;

-- 5) RLS: permitir DELETE para o purgador
-- auditoria_locatario: purgador só pode agir dentro do contexto de locatário (mantém isolamento)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='auditoria_locatario' AND policyname='p_auditoria_locatario_purgador'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_auditoria_locatario_purgador
      ON auditoria_locatario
      FOR DELETE
      TO multilocatario_purgador
      USING (locatario_id = app_locatario_id())
    $sql$;
  END IF;
END;
$$;

-- ============================================================
-- 6) Exemplo de job (padrão)
-- ============================================================
-- BEGIN;
--   -- Para expurgar tenant-scoped (exige contexto do locatário)
--   SELECT app_definir_contexto('USUARIO_JOB', 'LOCATARIO_A', false);
--   SET LOCAL ROLE multilocatario_purgador;
--
--   DELETE FROM auditoria_locatario
--   WHERE criado_em < now() - interval '180 days';
-- COMMIT;
--
-- BEGIN;
--   -- Para expurgar plataforma (modo plataforma)
--   SELECT app_definir_contexto('SUPERADMIN_ID', NULL, true);
--   SET LOCAL ROLE multilocatario_purgador;
--
--   DELETE FROM auditoria_plataforma
--   WHERE criado_em < now() - interval '365 days';
-- COMMIT;



-- ============================================================
-- AUDITORIA (v8) - EXPURGO CONTROLADO (Opção 1 aprovada)
-- Objetivo: manter auditoria append-only para aplicação, mas permitir DELETE para job de expurgo
-- Estratégia:
-- - Criar role NOLOGIN: multilocatario_purgador
-- - Trigger de imutabilidade permite DELETE apenas quando current_user = multilocatario_purgador
-- - UPDATE continua proibido para todos
-- Observação: o job deve executar `SET LOCAL ROLE multilocatario_purgador;` dentro da transação.
-- ============================================================

-- 1) Role de expurgo (NOLOGIN)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'multilocatario_purgador') THEN
    CREATE ROLE multilocatario_purgador NOLOGIN;
  END IF;
END;
$$;

-- 2) Permissões mínimas (ajuste conforme sua estratégia de grants)
-- A role purgadora precisa deletar e ler para filtrar por data.
GRANT SELECT, DELETE ON auditoria_locatario TO multilocatario_purgador;
GRANT SELECT, DELETE ON auditoria_plataforma TO multilocatario_purgador;

-- 3) Trigger de imutabilidade com exceção controlada para DELETE
CREATE OR REPLACE FUNCTION trg_auditoria_bloquear_update_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- UPDATE nunca é permitido
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'auditoria é append-only: UPDATE não permitido (%)', TG_TABLE_NAME;
  END IF;

  -- DELETE permitido somente para o purgador
  IF TG_OP = 'DELETE' THEN
    IF current_user = 'multilocatario_purgador' THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'auditoria é append-only: DELETE permitido apenas para multilocatario_purgador (%)', TG_TABLE_NAME;
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Recriar triggers para garantir uso da nova função
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_auditoria_locatario_immut') THEN
    EXECUTE 'DROP TRIGGER tg_auditoria_locatario_immut ON auditoria_locatario';
  END IF;

  EXECUTE '
    CREATE TRIGGER tg_auditoria_locatario_immut
    BEFORE UPDATE OR DELETE ON auditoria_locatario
    FOR EACH ROW
    EXECUTE FUNCTION trg_auditoria_bloquear_update_delete()
  ';
END;
$$;

-- 5) RLS: permitir DELETE para o purgador
-- auditoria_locatario: purgador só pode agir dentro do contexto de locatário (mantém isolamento)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='auditoria_locatario' AND policyname='p_auditoria_locatario_purgador'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_auditoria_locatario_purgador
      ON auditoria_locatario
      FOR DELETE
      TO multilocatario_purgador
      USING (locatario_id = app_locatario_id())
    $sql$;
  END IF;
END;
$$;

-- ============================================================
-- 6) Exemplo de job (padrão)
-- ============================================================
-- BEGIN;
--   -- Para expurgar tenant-scoped (exige contexto do locatário)
--   SELECT app_definir_contexto('USUARIO_JOB', 'LOCATARIO_A', false);
--   SET LOCAL ROLE multilocatario_purgador;
--
--   DELETE FROM auditoria_locatario
--   WHERE criado_em < now() - interval '180 days';
-- COMMIT;
--
-- BEGIN;
--   -- Para expurgar plataforma (modo plataforma)
--   SELECT app_definir_contexto('SUPERADMIN_ID', NULL, true);
--   SET LOCAL ROLE multilocatario_purgador;
--
--   DELETE FROM auditoria_plataforma
--   WHERE criado_em < now() - interval '365 days';
-- COMMIT;