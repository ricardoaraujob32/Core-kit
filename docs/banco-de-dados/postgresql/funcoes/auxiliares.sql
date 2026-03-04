CREATE OR REPLACE FUNCTION app_usuario_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('app.usuario_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app_locatario_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('app.locatario_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app_is_plataforma()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(NULLIF(current_setting('app.is_plataforma', true), ''), 'false')::boolean
$$;





ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_clientes_tenant
ON clientes
USING (locatario_id = app_locatario_id())
WITH CHECK (locatario_id = app_locatario_id());




ALTER TABLE auditoria_plataforma ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_auditoria_plataforma_somente_plataforma
ON auditoria_plataforma
USING (app_is_plataforma() = true)
WITH CHECK (app_is_plataforma() = true);



CREATE OR REPLACE FUNCTION app_definir_contexto(p_usuario_id uuid, p_locatario_id uuid, p_is_plataforma boolean)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  user_locatario uuid;
BEGIN
  SELECT u.locatario_id INTO user_locatario
  FROM usuarios u
  WHERE u.usuario_id = p_usuario_id
    AND u.excluido_em IS NULL;

  IF user_locatario IS NULL THEN
    -- Usuário de plataforma
    IF NOT p_is_plataforma THEN
      RAISE EXCEPTION 'usuário plataforma deve usar p_is_plataforma=true';
    END IF;

    -- Pode setar qualquer locatário alvo (inclusive NULL para modo plataforma puro)
    PERFORM set_config('app.usuario_id', p_usuario_id::text, true);
    PERFORM set_config('app.is_plataforma', 'true', true);

    IF p_locatario_id IS NULL THEN
      PERFORM set_config('app.locatario_id', '', true);
    ELSE
      PERFORM set_config('app.locatario_id', p_locatario_id::text, true);
    END IF;

  ELSE
    -- Usuário comum: só pode atuar no próprio locatário
    IF p_locatario_id IS DISTINCT FROM user_locatario THEN
      RAISE EXCEPTION 'usuário comum só pode atuar no próprio locatário';
    END IF;

    PERFORM set_config('app.usuario_id', p_usuario_id::text, true);
    PERFORM set_config('app.is_plataforma', 'false', true);
    PERFORM set_config('app.locatario_id', user_locatario::text, true);
  END IF;
END;
$$;



-- Usuário comum:
SELECT app_definir_contexto(:usuario_id, :locatario_id_do_usuario, false);

-- Superadmin, modo plataforma:
SELECT app_definir_contexto(:usuario_id, NULL, true);

-- Superadmin, atuando num locatário:
SELECT app_definir_contexto(:usuario_id, :locatario_alvo_id, true);


-- ============================================================
-- RLS + CONTEXTO (v3)
-- - SUPERADMIN pode "selecionar locatário" via contexto
-- - Usuário comum só atua no locatário em que foi criado
-- - Policies por tabela (onde faz sentido)
-- ============================================================

-- ============================================================
-- 1) Funções auxiliares para ler contexto (app.*)
-- ============================================================

CREATE OR REPLACE FUNCTION app_usuario_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('app.usuario_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app_locatario_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('app.locatario_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app_is_plataforma()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(NULLIF(current_setting('app.is_plataforma', true), ''), 'false')::boolean
$$;

-- ============================================================
-- 2) Definir contexto com regra:
--    - usuário comum: só pode usar o próprio locatário
--    - plataforma: pode usar locatário alvo (ou NULL para modo plataforma)
-- ============================================================

CREATE OR REPLACE FUNCTION app_definir_contexto(
  p_usuario_id uuid,
  p_locatario_id uuid,
  p_is_plataforma boolean
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  user_locatario uuid;
BEGIN
  SELECT u.locatario_id INTO user_locatario
  FROM usuarios u
  WHERE u.usuario_id = p_usuario_id
    AND u.excluido_em IS NULL;

  IF p_usuario_id IS NULL THEN
    RAISE EXCEPTION 'p_usuario_id é obrigatório';
  END IF;

  IF user_locatario IS NULL THEN
    -- Usuário de plataforma
    IF NOT p_is_plataforma THEN
      RAISE EXCEPTION 'usuário plataforma deve usar p_is_plataforma=true';
    END IF;

    PERFORM set_config('app.usuario_id', p_usuario_id::text, true);
    PERFORM set_config('app.is_plataforma', 'true', true);

    IF p_locatario_id IS NULL THEN
      PERFORM set_config('app.locatario_id', '', true);
    ELSE
      PERFORM set_config('app.locatario_id', p_locatario_id::text, true);
    END IF;

  ELSE
    -- Usuário comum: só pode atuar no próprio locatário
    IF p_locatario_id IS DISTINCT FROM user_locatario THEN
      RAISE EXCEPTION 'usuário comum só pode atuar no próprio locatário';
    END IF;

    IF p_is_plataforma THEN
      RAISE EXCEPTION 'usuário comum não pode definir is_plataforma=true';
    END IF;

    PERFORM set_config('app.usuario_id', p_usuario_id::text, true);
    PERFORM set_config('app.is_plataforma', 'false', true);
    PERFORM set_config('app.locatario_id', user_locatario::text, true);
  END IF;
END;
$$;

-- ============================================================
-- 3) Helper predicates (para não repetir lógica em policies)
-- ============================================================

-- Em modo "tenant" (contexto setado), isola por locatario_id.
-- Em modo "plataforma" (sem locatario), permite tudo se is_plataforma=true.
CREATE OR REPLACE FUNCTION rls_permite_tabela_tenant(p_row_locatario_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT
    CASE
      WHEN app_locatario_id() IS NOT NULL THEN (p_row_locatario_id = app_locatario_id())
      ELSE app_is_plataforma() = true
    END
$$;

-- Para CHECK (INSERT/UPDATE) em tabelas tenant, exige que:
-- - Se contexto tenant: row.locatario_id = app_locatario_id()
-- - Se modo plataforma: exige que app_is_plataforma=true E app_locatario_id() NÃO seja NULL
--   (ou seja: plataforma só escreve "dentro de um tenant" quando escolheu locatário)
CREATE OR REPLACE FUNCTION rls_check_tabela_tenant(p_row_locatario_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT
    CASE
      WHEN app_locatario_id() IS NOT NULL THEN (p_row_locatario_id = app_locatario_id())
      ELSE false
    END
$$;

-- ============================================================
-- 4) RLS por tabela (onde faz sentido)
-- ============================================================

-- ---------- LOCATARIOS (plataforma: tudo; tenant: só o próprio) ----------
ALTER TABLE locatarios ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'locatarios' AND policyname = 'p_locatarios_plataforma_all'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_locatarios_plataforma_all
      ON locatarios
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (app_is_plataforma() = true AND app_locatario_id() IS NULL)
      WITH CHECK (app_is_plataforma() = true AND app_locatario_id() IS NULL)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'locatarios' AND policyname = 'p_locatarios_tenant_own'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_locatarios_tenant_own
      ON locatarios
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (locatario_id = app_locatario_id())
      WITH CHECK (locatario_id = app_locatario_id())
    $sql$;
  END IF;
END;
$$;

-- ---------- CONFIGURACOES_LOCATARIO (tenant-scoped) ----------
ALTER TABLE configuracoes_locatario ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'configuracoes_locatario' AND policyname = 'p_config_locatario_tenant'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_config_locatario_tenant
      ON configuracoes_locatario
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- ---------- USUARIOS ----------
-- Regras:
-- - Em tenant-context (app_locatario_id != NULL): só usuários daquele locatário
-- - Em modo plataforma (is_plataforma=true e app_locatario_id NULL): pode ver/gerir todos (suporte)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'usuarios' AND policyname = 'p_usuarios_tenant_context'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_usuarios_tenant_context
      ON usuarios
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (
        app_locatario_id() IS NOT NULL
        AND locatario_id = app_locatario_id()
      )
      WITH CHECK (
        app_locatario_id() IS NOT NULL
        AND locatario_id = app_locatario_id()
      )
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'usuarios' AND policyname = 'p_usuarios_plataforma_all'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_usuarios_plataforma_all
      ON usuarios
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (app_is_plataforma() = true AND app_locatario_id() IS NULL)
      WITH CHECK (app_is_plataforma() = true AND app_locatario_id() IS NULL)
    $sql$;
  END IF;
END;
$$;

-- ---------- USUARIOS_PLATAFORMA (somente modo plataforma) ----------
ALTER TABLE usuarios_plataforma ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'usuarios_plataforma' AND policyname = 'p_usuarios_plataforma_only'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_usuarios_plataforma_only
      ON usuarios_plataforma
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (app_is_plataforma() = true AND app_locatario_id() IS NULL)
      WITH CHECK (app_is_plataforma() = true AND app_locatario_id() IS NULL)
    $sql$;
  END IF;
END;
$$;

-- ---------- USUARIOS_PAPEIS (tenant-scoped) ----------
ALTER TABLE usuarios_papeis ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'usuarios_papeis' AND policyname = 'p_usuarios_papeis_tenant'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_usuarios_papeis_tenant
      ON usuarios_papeis
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- ---------- PAPEIS / PERMISSOES / PAPEL_PERMISSOES (globais) ----------
-- Normalmente: leitura para todos; escrita só via migrador/migrations.
ALTER TABLE papeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE papel_permissoes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='papeis' AND policyname='p_papeis_read'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_papeis_read
      ON papeis
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (true)
      WITH CHECK (false)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='permissoes' AND policyname='p_permissoes_read'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_permissoes_read
      ON permissoes
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (true)
      WITH CHECK (false)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='papel_permissoes' AND policyname='p_papel_permissoes_read'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_papel_permissoes_read
      ON papel_permissoes
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (true)
      WITH CHECK (false)
    $sql$;
  END IF;

  -- Escrita para migrador (migrations controladas)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='papeis' AND policyname='p_papeis_migrador_write'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_papeis_migrador_write
      ON papeis
      TO multilocatario_migrador
      USING (true)
      WITH CHECK (true)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='permissoes' AND policyname='p_permissoes_migrador_write'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_permissoes_migrador_write
      ON permissoes
      TO multilocatario_migrador
      USING (true)
      WITH CHECK (true)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='papel_permissoes' AND policyname='p_papel_permissoes_migrador_write'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_papel_permissoes_migrador_write
      ON papel_permissoes
      TO multilocatario_migrador
      USING (true)
      WITH CHECK (true)
    $sql$;
  END IF;
END;
$$;

-- ---------- TOKENS (tenant-scoped, e opcionalmente plataforma em modo plataforma) ----------
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tokens' AND policyname='p_tokens_tenant'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_tokens_tenant
      ON tokens
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- ---------- AUDITORIA_LOCATARIO (tenant-scoped) ----------
ALTER TABLE auditoria_locatario ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='auditoria_locatario' AND policyname='p_auditoria_locatario_tenant'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_auditoria_locatario_tenant
      ON auditoria_locatario
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- ---------- AUDITORIA_PLATAFORMA (somente plataforma) ----------
ALTER TABLE auditoria_plataforma ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='auditoria_plataforma' AND policyname='p_auditoria_plataforma_only'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_auditoria_plataforma_only
      ON auditoria_plataforma
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (app_is_plataforma() = true AND app_locatario_id() IS NULL)
      WITH CHECK (app_is_plataforma() = true AND app_locatario_id() IS NULL)
    $sql$;
  END IF;
END;
$$;

-- ============================================================
-- 5) Tabelas operacionais (todas tenant-scoped)
-- ============================================================

-- CLIENTES
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='p_clientes_tenant') THEN
    EXECUTE $sql$
      CREATE POLICY p_clientes_tenant
      ON clientes
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- FORNECEDORES
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fornecedores' AND policyname='p_fornecedores_tenant') THEN
    EXECUTE $sql$
      CREATE POLICY p_fornecedores_tenant
      ON fornecedores
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- ESTOQUES
ALTER TABLE estoques ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='estoques' AND policyname='p_estoques_tenant') THEN
    EXECUTE $sql$
      CREATE POLICY p_estoques_tenant
      ON estoques
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- PRODUTOS
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='produtos' AND policyname='p_produtos_tenant') THEN
    EXECUTE $sql$
      CREATE POLICY p_produtos_tenant
      ON produtos
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- PRODUTOS_ESTOQUE
ALTER TABLE produtos_estoque ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='produtos_estoque' AND policyname='p_produtos_estoque_tenant') THEN
    EXECUTE $sql$
      CREATE POLICY p_produtos_estoque_tenant
      ON produtos_estoque
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- ORDENS_SERVICO
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ordens_servico' AND policyname='p_ordens_servico_tenant') THEN
    EXECUTE $sql$
      CREATE POLICY p_ordens_servico_tenant
      ON ordens_servico
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- TRANSACOES
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transacoes' AND policyname='p_transacoes_tenant') THEN
    EXECUTE $sql$
      CREATE POLICY p_transacoes_tenant
      ON transacoes
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- ITENS_TRANSACAO
ALTER TABLE itens_transacao ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='itens_transacao' AND policyname='p_itens_transacao_tenant') THEN
    EXECUTE $sql$
      CREATE POLICY p_itens_transacao_tenant
      ON itens_transacao
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- MOVIMENTACOES_ESTOQUE
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='movimentacoes_estoque' AND policyname='p_movimentacoes_estoque_tenant') THEN
    EXECUTE $sql$
      CREATE POLICY p_movimentacoes_estoque_tenant
      ON movimentacoes_estoque
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (rls_permite_tabela_tenant(locatario_id))
      WITH CHECK (rls_check_tabela_tenant(locatario_id))
    $sql$;
  END IF;
END;
$$;

-- ============================================================
-- 6) Sugestões opcionais (comentadas)
-- ============================================================

-- (Opcional) Forçar RLS inclusive para o OWNER da tabela (não afeta superuser):
-- ALTER TABLE <tabela> FORCE ROW LEVEL SECURITY;

-- (Opcional) exigir que app_locatario_id esteja setado para qualquer DML em tabelas tenant
-- (já está garantido pelo rls_check_tabela_tenant -> false quando app_locatario_id é NULL)

-- (Opcional) Se quiser que "modo plataforma (sem locatario)" nunca enxergue tabelas tenant:
-- troque rls_permite_tabela_tenant() para retornar false quando app_locatario_id IS NULL.





