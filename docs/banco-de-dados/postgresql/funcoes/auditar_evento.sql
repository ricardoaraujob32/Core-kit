-- =========================================================
-- util: auditoria (genérica)
-- =========================================================
CREATE OR REPLACE FUNCTION fn_auditar_evento(
  p_tipo_evento text,
  p_acao text,
  p_recurso text,
  p_recurso_id text,
  p_resultado text,
  p_detalhes jsonb
)
RETURNS void AS $$
DECLARE
  v_usuario_id uuid;
  v_locatario_id uuid;
  v_ip text;
  v_user_agent text;
  v_corr text;
BEGIN
  v_usuario_id := NULLIF(fn_configuracoes_app('app.usuario_id'), '')::uuid;
  v_locatario_id := NULLIF(fn_configuracoes_app('app.locatario_id'), '')::uuid;
  v_ip := fn_configuracoes_app('app.ip');
  v_user_agent := fn_configuracoes_app('app.user_agent');
  v_corr := fn_configuracoes_app('app.correlation_id');

  INSERT INTO auditoria (
    id,
    locatario_id,
    usuario_id,
    tipo_evento,
    acao,
    recurso,
    recurso_id,
    resultado,
    detalhes,
    ip,
    user_agent,
    correlation_id,
    criado_em
  ) VALUES (
    gen_random_uuid(),
    v_locatario_id,
    v_usuario_id,
    p_tipo_evento,
    p_acao,
    p_recurso,
    p_recurso_id,
    p_resultado,
    COALESCE(p_detalhes, '{}'::jsonb),
    v_ip,
    v_user_agent,
    v_corr,
    now()
  );
END;
$$ LANGUAGE plpgsql;