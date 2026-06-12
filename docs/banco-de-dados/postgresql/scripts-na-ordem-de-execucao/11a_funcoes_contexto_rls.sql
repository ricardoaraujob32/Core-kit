-- ============================================================
-- 11a_funcoes_contexto_rls.sql
-- Funções de contexto para RLS e auditoria
--
-- Modelo atual:
-- - core.usuarios: usuários de locatário
-- - core.usuarios_plataforma: usuários da plataforma
--
-- Variáveis de sessão usadas:
-- - app.locatario_id
-- - app.usuario_id
-- - app.usuario_plataforma_id
-- - app.is_plataforma
-- - app.requisicao_id
-- - app.endereco_ip
-- - app.agente_usuario
--
-- Observação:
-- - Use SET LOCAL / set_config(..., true) dentro de transações.
-- - O backend deve definir o contexto no início da requisição/transação.
-- ============================================================

SET search_path TO core, public;

-- ============================================================
-- 1) Leitores de contexto
-- ============================================================

CREATE OR REPLACE FUNCTION core.app_locatario_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.locatario_id', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION core.app_usuario_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.usuario_id', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION core.app_usuario_plataforma_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.usuario_plataforma_id', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION core.app_is_plataforma()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(NULLIF(current_setting('app.is_plataforma', true), '')::boolean, false);
$$;

CREATE OR REPLACE FUNCTION core.app_requisicao_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.requisicao_id', true), '');
$$;

CREATE OR REPLACE FUNCTION core.app_endereco_ip()
RETURNS inet
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.endereco_ip', true), '')::inet;
$$;

CREATE OR REPLACE FUNCTION core.app_agente_usuario()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.agente_usuario', true), '');
$$;

-- ============================================================
-- 2) Limpeza de contexto
-- ============================================================

CREATE OR REPLACE FUNCTION core.app_limpar_contexto()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('app.locatario_id', '', true);
  PERFORM set_config('app.usuario_id', '', true);
  PERFORM set_config('app.usuario_plataforma_id', '', true);
  PERFORM set_config('app.is_plataforma', 'false', true);
  PERFORM set_config('app.requisicao_id', '', true);
  PERFORM set_config('app.endereco_ip', '', true);
  PERFORM set_config('app.agente_usuario', '', true);
END;
$$;

-- ============================================================
-- 3) Contexto de usuário do locatário
-- ============================================================

CREATE OR REPLACE FUNCTION core.app_definir_contexto_locatario(
  p_locatario_id uuid,
  p_usuario_id uuid,
  p_requisicao_id text DEFAULT NULL,
  p_endereco_ip inet DEFAULT NULL,
  p_agente_usuario text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, public
AS $$
DECLARE
  v_existe boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM core.usuarios u
    JOIN core.locatarios l
      ON l.locatario_id = u.locatario_id
    WHERE u.locatario_id = p_locatario_id
      AND u.usuario_id = p_usuario_id
      AND u.excluido_em IS NULL
      AND u.ativo = true
      AND l.excluido_em IS NULL
      AND l.status = 'ATIVO'
  )
  INTO v_existe;

  IF NOT v_existe THEN
    RAISE EXCEPTION 'contexto de locatário inválido: locatario_id=%, usuario_id=%',
      p_locatario_id, p_usuario_id
      USING ERRCODE = '28000';
  END IF;

  PERFORM set_config('app.locatario_id', p_locatario_id::text, true);
  PERFORM set_config('app.usuario_id', p_usuario_id::text, true);
  PERFORM set_config('app.usuario_plataforma_id', '', true);
  PERFORM set_config('app.is_plataforma', 'false', true);

  PERFORM set_config('app.requisicao_id', COALESCE(p_requisicao_id, ''), true);
  PERFORM set_config('app.endereco_ip', COALESCE(p_endereco_ip::text, ''), true);
  PERFORM set_config('app.agente_usuario', COALESCE(p_agente_usuario, ''), true);
END;
$$;

-- ============================================================
-- 4) Contexto de usuário da plataforma
-- ============================================================
-- p_locatario_alvo_id é opcional:
-- - NULL: ação global da plataforma
-- - UUID: plataforma atuando sobre um locatário específico
-- ============================================================

CREATE OR REPLACE FUNCTION core.app_definir_contexto_plataforma(
  p_usuario_plataforma_id uuid,
  p_locatario_alvo_id uuid DEFAULT NULL,
  p_requisicao_id text DEFAULT NULL,
  p_endereco_ip inet DEFAULT NULL,
  p_agente_usuario text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, public
AS $$
DECLARE
  v_usuario_existe boolean;
  v_locatario_existe boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM core.usuarios_plataforma up
    WHERE up.usuario_id = p_usuario_plataforma_id
      AND up.excluido_em IS NULL
      AND up.ativo = true
  )
  INTO v_usuario_existe;

  IF NOT v_usuario_existe THEN
    RAISE EXCEPTION 'contexto de plataforma inválido: usuario_plataforma_id=%',
      p_usuario_plataforma_id
      USING ERRCODE = '28000';
  END IF;

  IF p_locatario_alvo_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM core.locatarios l
      WHERE l.locatario_id = p_locatario_alvo_id
        AND l.excluido_em IS NULL
    )
    INTO v_locatario_existe;

    IF NOT v_locatario_existe THEN
      RAISE EXCEPTION 'locatário alvo inválido: locatario_id=%',
        p_locatario_alvo_id
        USING ERRCODE = '28000';
    END IF;
  END IF;

  PERFORM set_config('app.locatario_id', COALESCE(p_locatario_alvo_id::text, ''), true);
  PERFORM set_config('app.usuario_id', '', true);
  PERFORM set_config('app.usuario_plataforma_id', p_usuario_plataforma_id::text, true);
  PERFORM set_config('app.is_plataforma', 'true', true);

  PERFORM set_config('app.requisicao_id', COALESCE(p_requisicao_id, ''), true);
  PERFORM set_config('app.endereco_ip', COALESCE(p_endereco_ip::text, ''), true);
  PERFORM set_config('app.agente_usuario', COALESCE(p_agente_usuario, ''), true);
END;
$$;

-- ============================================================
-- 5) Função única de compatibilidade
-- ============================================================
-- Usa p_is_plataforma para decidir qual tabela validar.
-- Mantida para facilitar integração inicial no backend.
-- ============================================================

CREATE OR REPLACE FUNCTION core.app_definir_contexto(
  p_usuario_id uuid,
  p_locatario_id uuid DEFAULT NULL,
  p_is_plataforma boolean DEFAULT false,
  p_requisicao_id text DEFAULT NULL,
  p_endereco_ip inet DEFAULT NULL,
  p_agente_usuario text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, public
AS $$
BEGIN
  IF p_is_plataforma THEN
    PERFORM core.app_definir_contexto_plataforma(
      p_usuario_plataforma_id := p_usuario_id,
      p_locatario_alvo_id := p_locatario_id,
      p_requisicao_id := p_requisicao_id,
      p_endereco_ip := p_endereco_ip,
      p_agente_usuario := p_agente_usuario
    );
  ELSE
    IF p_locatario_id IS NULL THEN
      RAISE EXCEPTION 'locatario_id é obrigatório para contexto de usuário de locatário'
        USING ERRCODE = '22023';
    END IF;

    PERFORM core.app_definir_contexto_locatario(
      p_locatario_id := p_locatario_id,
      p_usuario_id := p_usuario_id,
      p_requisicao_id := p_requisicao_id,
      p_endereco_ip := p_endereco_ip,
      p_agente_usuario := p_agente_usuario
    );
  END IF;
END;
$$;

-- ============================================================
-- 6) Ownership
-- ============================================================

ALTER FUNCTION core.app_locatario_id() OWNER TO posse;
ALTER FUNCTION core.app_usuario_id() OWNER TO posse;
ALTER FUNCTION core.app_usuario_plataforma_id() OWNER TO posse;
ALTER FUNCTION core.app_is_plataforma() OWNER TO posse;
ALTER FUNCTION core.app_requisicao_id() OWNER TO posse;
ALTER FUNCTION core.app_endereco_ip() OWNER TO posse;
ALTER FUNCTION core.app_agente_usuario() OWNER TO posse;
ALTER FUNCTION core.app_limpar_contexto() OWNER TO posse;
ALTER FUNCTION core.app_definir_contexto_locatario(uuid, uuid, text, inet, text) OWNER TO posse;
ALTER FUNCTION core.app_definir_contexto_plataforma(uuid, uuid, text, inet, text) OWNER TO posse;
ALTER FUNCTION core.app_definir_contexto(uuid, uuid, boolean, text, inet, text) OWNER TO posse;
