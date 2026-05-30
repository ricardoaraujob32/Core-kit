-- ============================================================
-- 11_funcoes_extraidas_corrigidas.sql
-- Funções extraídas e compatibilizadas com o modelo atual
--
-- Fonte: arquivos enviados nesta etapa.
-- Ajustes aplicados:
-- - funções movidas para schema api;
-- - tabelas qualificadas com core/audit/jobs;
-- - auditoria adaptada para audit.auditoria_locatario e audit.auditoria_plataforma;
-- - removidas referências legadas a public, auditoria genérica, user_roles, produtos_estoque e tokens genérico.
--
-- Observação:
-- - os nomes das variáveis de sessão continuam como app.* porque são GUCs de sessão,
--   não nomes de schema.
-- ============================================================

SET search_path TO api, core, audit, jobs, public;

-- ============================================================
-- 1) Contexto da requisição
-- ============================================================

CREATE OR REPLACE FUNCTION api.ctx_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION api.ctx_scope()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.scope', true), '');
$$;

CREATE OR REPLACE FUNCTION api.ctx_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION api.ctx_request_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.request_id', true), '');
$$;

CREATE OR REPLACE FUNCTION api.ctx_ip()
RETURNS inet
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.ip', true), '')::inet;
$$;

CREATE OR REPLACE FUNCTION api.ctx_user_agent()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_agent', true), '');
$$;

-- ============================================================
-- 2) Validações de contexto
-- ============================================================

CREATE OR REPLACE FUNCTION api.assert_scope(expected text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF api.ctx_scope() IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'Contexto inválido: esperado scope %, atual %', expected, api.ctx_scope();
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION api.assert_user()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF api.ctx_user_id() IS NULL THEN
    RAISE EXCEPTION 'Contexto inválido: app.user_id não configurado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION api.assert_tenant()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM api.assert_user();
  PERFORM api.assert_scope('TENANT');

  IF api.ctx_tenant_id() IS NULL THEN
    RAISE EXCEPTION 'Contexto inválido: app.tenant_id não configurado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION api.assert_platform()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM api.assert_user();
  PERFORM api.assert_scope('PLATAFORMA');

  IF api.ctx_tenant_id() IS NOT NULL THEN
    RAISE EXCEPTION 'Contexto inválido: app.tenant_id não deve estar setado em PLATAFORMA';
  END IF;
END;
$$;

-- ============================================================
-- 3) Predicados para policies RLS
-- ============================================================

CREATE OR REPLACE FUNCTION api.rls_tenant_read(p_row_locatario_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    api.ctx_scope() = 'TENANT'
    AND api.ctx_tenant_id() IS NOT NULL
    AND p_row_locatario_id = api.ctx_tenant_id();
$$;

CREATE OR REPLACE FUNCTION api.rls_tenant_write(p_row_locatario_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    api.ctx_scope() = 'TENANT'
    AND api.ctx_tenant_id() IS NOT NULL
    AND p_row_locatario_id = api.ctx_tenant_id();
$$;

CREATE OR REPLACE FUNCTION api.rls_platform()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    api.ctx_scope() = 'PLATAFORMA'
    AND api.ctx_user_id() IS NOT NULL
    AND api.ctx_tenant_id() IS NULL;
$$;

-- ============================================================
-- 4) Utilitárias para triggers
-- ============================================================

CREATE OR REPLACE FUNCTION api.fn_definir_criado_e_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.criado_em IS NULL THEN
      NEW.criado_em := now();
    END IF;

    IF NEW.atualizado_em IS NULL THEN
      NEW.atualizado_em := now();
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.atualizado_em := now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION api.fn_definir_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION api.fn_normalizar_nome()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.nome IS NOT NULL THEN
    NEW.nome := btrim(NEW.nome);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION api.fn_normalizar_email_usuario()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email := lower(btrim(NEW.email));
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 5) Proteção de exclusão física de locatário
-- ============================================================

CREATE OR REPLACE FUNCTION api.fn_impedir_exclusao_locatario_com_usuarios()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM core.usuarios u
    WHERE u.locatario_id = OLD.locatario_id
      AND u.excluido_em IS NULL
  ) THEN
    RAISE EXCEPTION 'Não é permitido excluir locatário com usuários ativos';
  END IF;

  RETURN OLD;
END;
$$;

-- ============================================================
-- 6) Auditoria compatível com as tabelas atuais
-- ============================================================

CREATE OR REPLACE FUNCTION api.auditar_locatario(
  p_evento text,
  p_sucesso boolean DEFAULT true,
  p_entidade_nome text DEFAULT NULL,
  p_entidade_tipo text DEFAULT NULL,
  p_entidade_id text DEFAULT NULL,
  p_erro_codigo text DEFAULT NULL,
  p_erro_mensagem text DEFAULT NULL,
  p_origem text DEFAULT NULL,
  p_agente_tipo text DEFAULT NULL,
  p_metadados jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM api.assert_tenant();

  INSERT INTO audit.auditoria_locatario (
    locatario_id,
    auditoria_id,
    usuario_id,
    evento,
    sucesso,
    erro_codigo,
    erro_mensagem,
    entidade_nome,
    entidade_tipo,
    entidade_id,
    origem,
    requisicao_id,
    endereco_ip,
    agente_usuario,
    agente_tipo,
    metadados,
    criado_em
  )
  VALUES (
    api.ctx_tenant_id(),
    gen_random_uuid(),
    api.ctx_user_id(),
    p_evento,
    p_sucesso,
    p_erro_codigo,
    p_erro_mensagem,
    p_entidade_nome,
    p_entidade_tipo,
    p_entidade_id,
    p_origem,
    api.ctx_request_id(),
    api.ctx_ip(),
    api.ctx_user_agent(),
    p_agente_tipo,
    COALESCE(p_metadados, '{}'::jsonb),
    now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION api.auditar_plataforma(
  p_evento text,
  p_sucesso boolean DEFAULT true,
  p_locatario_alvo_id uuid DEFAULT NULL,
  p_entidade_nome text DEFAULT NULL,
  p_entidade_tipo text DEFAULT NULL,
  p_entidade_id text DEFAULT NULL,
  p_erro_codigo text DEFAULT NULL,
  p_erro_mensagem text DEFAULT NULL,
  p_origem text DEFAULT NULL,
  p_agente_tipo text DEFAULT NULL,
  p_metadados jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM api.assert_platform();

  INSERT INTO audit.auditoria_plataforma (
    auditoria_id,
    usuario_id,
    locatario_alvo_id,
    evento,
    sucesso,
    erro_codigo,
    erro_mensagem,
    entidade_nome,
    entidade_tipo,
    entidade_id,
    origem,
    requisicao_id,
    endereco_ip,
    agente_usuario,
    agente_tipo,
    metadados,
    criado_em
  )
  VALUES (
    gen_random_uuid(),
    api.ctx_user_id(),
    p_locatario_alvo_id,
    p_evento,
    p_sucesso,
    p_erro_codigo,
    p_erro_mensagem,
    p_entidade_nome,
    p_entidade_tipo,
    p_entidade_id,
    p_origem,
    api.ctx_request_id(),
    api.ctx_ip(),
    api.ctx_user_agent(),
    p_agente_tipo,
    COALESCE(p_metadados, '{}'::jsonb),
    now()
  );
END;
$$;

-- ============================================================
-- 7) Ownership das funções
-- ============================================================

ALTER FUNCTION api.ctx_user_id() OWNER TO posse;
ALTER FUNCTION api.ctx_scope() OWNER TO posse;
ALTER FUNCTION api.ctx_tenant_id() OWNER TO posse;
ALTER FUNCTION api.ctx_request_id() OWNER TO posse;
ALTER FUNCTION api.ctx_ip() OWNER TO posse;
ALTER FUNCTION api.ctx_user_agent() OWNER TO posse;
ALTER FUNCTION api.assert_scope(text) OWNER TO posse;
ALTER FUNCTION api.assert_user() OWNER TO posse;
ALTER FUNCTION api.assert_tenant() OWNER TO posse;
ALTER FUNCTION api.assert_platform() OWNER TO posse;
ALTER FUNCTION api.rls_tenant_read(uuid) OWNER TO posse;
ALTER FUNCTION api.rls_tenant_write(uuid) OWNER TO posse;
ALTER FUNCTION api.rls_platform() OWNER TO posse;
ALTER FUNCTION api.fn_definir_criado_e_atualizado_em() OWNER TO posse;
ALTER FUNCTION api.fn_definir_atualizado_em() OWNER TO posse;
ALTER FUNCTION api.fn_normalizar_nome() OWNER TO posse;
ALTER FUNCTION api.fn_normalizar_email_usuario() OWNER TO posse;
ALTER FUNCTION api.fn_impedir_exclusao_locatario_com_usuarios() OWNER TO posse;
ALTER FUNCTION api.auditar_locatario(text, boolean, text, text, text, text, text, text, text, jsonb) OWNER TO posse;
ALTER FUNCTION api.auditar_plataforma(text, boolean, uuid, text, text, text, text, text, text, text, jsonb) OWNER TO posse;
