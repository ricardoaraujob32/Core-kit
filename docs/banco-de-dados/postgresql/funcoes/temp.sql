-- Como setar no início de cada request (backend)
-- Request de locatário (admin do locatário e usuários do locatário)
-- app.scope = 'TENANT'
-- app.tenant_id = <locatario_id>
-- app.user_id = <usuario_id>
-- opcionais: request_id, ip, user_agent
-- Request de plataforma (superadmin)
-- app.scope = 'PLATAFORMA'
-- app.user_id = <usuario_id_superadmin>
-- não setar app.tenant_id
-- opcionais: request_id, ip, user_agent
-- se a ação afetar um tenant, você passa isso como dado: locatario_alvo_id (coluna do audit)
-- Importante: use SET LOCAL (ou set_config(..., true)) dentro da transação do request, para não “vazar” contexto entre requisições em pool de conexões.

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.ctx_user_id()
RETURNS uuid
LANGUAGE sql
AS $$
  SELECT nullif(current_setting('app.user_id', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION app.ctx_scope()
RETURNS text
LANGUAGE sql
AS $$
  SELECT nullif(current_setting('app.scope', true), '');
$$;

CREATE OR REPLACE FUNCTION app.ctx_tenant_id()
RETURNS uuid
LANGUAGE sql
AS $$
  SELECT nullif(current_setting('app.tenant_id', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION app.ctx_request_id()
RETURNS text
LANGUAGE sql
AS $$
  SELECT nullif(current_setting('app.request_id', true), '');
$$;

CREATE OR REPLACE FUNCTION app.ctx_ip()
RETURNS text
LANGUAGE sql
AS $$
  SELECT nullif(current_setting('app.ip', true), '');
$$;

CREATE OR REPLACE FUNCTION app.ctx_user_agent()
RETURNS text
LANGUAGE sql
AS $$
  SELECT nullif(current_setting('app.user_agent', true), '');
$$;

















CREATE OR REPLACE FUNCTION app.assert_scope(expected text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF app.ctx_scope() IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'Contexto inválido: esperado scope %, atual %', expected, app.ctx_scope();
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION app.assert_user()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF app.ctx_user_id() IS NULL THEN
    RAISE EXCEPTION 'Contexto inválido: app.user_id não configurado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION app.assert_tenant()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM app.assert_scope('TENANT');
  IF app.ctx_tenant_id() IS NULL THEN
    RAISE EXCEPTION 'Contexto inválido: app.tenant_id não configurado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION app.assert_platform()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM app.assert_scope('PLATAFORMA');
  -- por segurança, garanta que tenant_id não esteja setado no modo plataforma
  IF app.ctx_tenant_id() IS NOT NULL THEN
    RAISE EXCEPTION 'Contexto inválido: app.tenant_id não deve estar setado em PLATAFORMA';
  END IF;
END;
$$;



















-- Padrão:
-- USING (locatario_id = app.ctx_tenant_id())
-- WITH CHECK (locatario_id = app.ctx_tenant_id())
-- e exigir TENANT + user_id
-- Exemplo (aplique em todas as tabelas tenant-scoped; mostro com auditoria_locatario):

ALTER TABLE auditoria_locatario ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_locatario FORCE ROW LEVEL SECURITY;

CREATE POLICY auditoria_locatario_rls
ON auditoria_locatario
USING (
  app.ctx_scope() = 'TENANT'
  AND app.ctx_tenant_id() IS NOT NULL
  AND locatario_id = app.ctx_tenant_id()
)
WITH CHECK (
  app.ctx_scope() = 'TENANT'
  AND app.ctx_tenant_id() IS NOT NULL
  AND locatario_id = app.ctx_tenant_id()
);


ALTER TABLE auditoria_plataforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_plataforma FORCE ROW LEVEL SECURITY;

CREATE POLICY auditoria_plataforma_rls
ON auditoria_plataforma
USING (
  app.ctx_scope() = 'PLATAFORMA'
  AND app.ctx_user_id() IS NOT NULL
)
WITH CHECK (
  app.ctx_scope() = 'PLATAFORMA'
  AND app.ctx_user_id() IS NOT NULL
);






CREATE OR REPLACE FUNCTION app.log_auditoria_locatario(
  p_acao text,
  p_tipo_entidade text,
  p_entidade_id uuid,
  p_metadados jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM app.assert_user();
  PERFORM app.assert_tenant();

  INSERT INTO auditoria_locatario (
    auditoria_id,
    locatario_id,
    acao,
    tipo_entidade,
    entidade_id,
    usuario_executor_id,
    requisicao_id,
    endereco_ip,
    agente_usuario,
    metadados,
    criado_em
  )
  VALUES (
    gen_random_uuid(),
    app.ctx_tenant_id(),
    p_acao,
    p_tipo_entidade,
    p_entidade_id,
    app.ctx_user_id(),
    app.ctx_request_id(),
    app.ctx_ip(),
    app.ctx_user_agent(),
    COALESCE(p_metadados, '{}'::jsonb),
    now()
  );
END;
$$;








CREATE OR REPLACE FUNCTION app.log_auditoria_plataforma(
  p_acao text,
  p_tipo_entidade text,
  p_entidade_id uuid,
  p_locatario_alvo_id uuid DEFAULT NULL,
  p_metadados jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM app.assert_user();
  PERFORM app.assert_platform();

  INSERT INTO auditoria_plataforma (
    auditoria_id,
    acao,
    tipo_entidade,
    entidade_id,
    locatario_alvo_id,
    usuario_executor_id,
    requisicao_id,
    endereco_ip,
    agente_usuario,
    metadados,
    criado_em
  )
  VALUES (
    gen_random_uuid(),
    p_acao,
    p_tipo_entidade,
    p_entidade_id,
    p_locatario_alvo_id,
    app.ctx_user_id(),
    app.ctx_request_id(),
    app.ctx_ip(),
    app.ctx_user_agent(),
    COALESCE(p_metadados, '{}'::jsonb),
    now()
  );
END;
$$;







-- Checklist de implementação no backend
-- No começo da transação do request:
-- SET LOCAL app.scope = ...
-- SET LOCAL app.user_id = ...
-- SET LOCAL app.tenant_id = ... (só tenant)
-- SET LOCAL app.request_id = ... etc.
-- Garantir que toda operação que grava dados tenant-scoped rode com TENANT configurado.
-- Garantir que toda operação de plataforma (superadmin) rode com PLATAFORMA e nunca set tenant_id.
