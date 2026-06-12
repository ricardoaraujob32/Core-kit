DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_locatarios_timestamps') THEN
    CREATE TRIGGER trg_locatarios_timestamps
    BEFORE INSERT OR UPDATE ON locatarios
    FOR EACH ROW EXECUTE FUNCTION fn_set_criado_e_atualizado_em();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_locatarios_before_ins_upd') THEN
    CREATE TRIGGER trg_locatarios_before_ins_upd
    BEFORE INSERT OR UPDATE ON locatarios
    FOR EACH ROW EXECUTE FUNCTION fn_locatarios_before_ins_upd();
  END IF;
END $$;






CREATE OR REPLACE FUNCTION fn_locatarios_after_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM fn_auditar_evento(
    'LOCATARIO_CRIADO',
    'CRIAR',
    'locatarios',
    NEW.id::text,
    'SUCESSO',
    jsonb_build_object('nome', NEW.nome)
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_locatarios_after_update()
RETURNS TRIGGER AS $$
DECLARE
  v_alterados jsonb := '{}'::jsonb;
BEGIN
  -- registra apenas “quais campos mudaram” (seguro e útil)
  IF NEW.nome IS DISTINCT FROM OLD.nome THEN
    v_alterados := v_alterados || jsonb_build_object('nome', jsonb_build_object('de', OLD.nome, 'para', NEW.nome));
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_alterados := v_alterados || jsonb_build_object('status', jsonb_build_object('de', OLD.status, 'para', NEW.status));
  END IF;

  PERFORM fn_auditar_evento(
    'LOCATARIO_ATUALIZADO',
    'ATUALIZAR',
    'locatarios',
    NEW.id::text,
    'SUCESSO',
    jsonb_build_object('alteracoes', v_alterados)
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_locatarios_after_insert') THEN
    CREATE TRIGGER trg_locatarios_after_insert
    AFTER INSERT ON locatarios
    FOR EACH ROW EXECUTE FUNCTION fn_locatarios_after_insert();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_locatarios_after_update') THEN
    CREATE TRIGGER trg_locatarios_after_update
    AFTER UPDATE ON locatarios
    FOR EACH ROW EXECUTE FUNCTION fn_locatarios_after_update();
  END IF;
END $$;







DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_usuarios_timestamps') THEN
    CREATE TRIGGER trg_usuarios_timestamps
    BEFORE INSERT OR UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_set_criado_e_atualizado_em();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_usuarios_normalizar_email') THEN
    CREATE TRIGGER trg_usuarios_normalizar_email
    BEFORE INSERT OR UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_normalizar_email_usuario();
  END IF;
END $$;








CREATE OR REPLACE FUNCTION fn_usuarios_after_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM fn_auditar_evento(
    'USUARIO_CRIADO',
    'CRIAR',
    'usuarios',
    NEW.id::text,
    'SUCESSO',
    jsonb_build_object('email', NEW.email, 'locatario_id', NEW.locatario_id)
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_usuarios_after_insert') THEN
    CREATE TRIGGER trg_usuarios_after_insert
    AFTER INSERT ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_usuarios_after_insert();
  END IF;
END $$;











CREATE OR REPLACE FUNCTION fn_revogar_tokens_usuario(p_usuario_id uuid, p_locatario_id uuid, p_motivo text)
RETURNS void AS $$
BEGIN
  UPDATE tokens_atualizacao
     SET revogado_em = now()
   WHERE usuario_id = p_usuario_id
     AND (locatario_id IS NOT DISTINCT FROM p_locatario_id)
     AND revogado_em IS NULL;

  PERFORM fn_auditar_evento(
    'TOKENS_REVOGADOS',
    'ATUALIZAR',
    'tokens_atualizacao',
    NULL,
    'SUCESSO',
    jsonb_build_object('usuario_id', p_usuario_id, 'locatario_id', p_locatario_id, 'motivo', p_motivo)
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_usuarios_after_update()
RETURNS TRIGGER AS $$
DECLARE
  v_alterados jsonb := '{}'::jsonb;
  v_revogar boolean := false;
  v_motivo text := NULL;
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    v_alterados := v_alterados || jsonb_build_object('email', jsonb_build_object('de', OLD.email, 'para', NEW.email));
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_alterados := v_alterados || jsonb_build_object('status', jsonb_build_object('de', OLD.status, 'para', NEW.status));
    v_revogar := true;
    v_motivo := 'mudanca_status';
  END IF;

  -- se seu schema tiver senha_hash (ou campo equivalente)
  IF (NEW.senha_hash IS DISTINCT FROM OLD.senha_hash) THEN
    v_alterados := v_alterados || jsonb_build_object('senha', 'alterada');
    v_revogar := true;
    v_motivo := COALESCE(v_motivo, 'mudanca_senha');
  END IF;

  PERFORM fn_auditar_evento(
    'USUARIO_ATUALIZADO',
    'ATUALIZAR',
    'usuarios',
    NEW.id::text,
    'SUCESSO',
    jsonb_build_object('alteracoes', v_alterados)
  );

  IF v_revogar THEN
    PERFORM fn_revogar_tokens_usuario(NEW.id, NEW.locatario_id, v_motivo);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_usuarios_after_update') THEN
    CREATE TRIGGER trg_usuarios_after_update
    AFTER UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_usuarios_after_update();
  END IF;
END $$;



CREATE ROLE db_owner LOGIN PASSWORD '...';
GRANT ALL PRIVILEGES ON SCHEMA main TO db_owner;

CREATE ROLE app_user LOGIN PASSWORD '...';

GRANT USAGE ON SCHEMA main TO app_user;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA main
TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA main
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;


ALTER TABLE main.usuarios ENABLE ROW LEVEL SECURITY;


CREATE POLICY usuarios_isolamento_locatario
ON main.usuarios
USING (locatario_id = current_setting('app.locatario_id')::uuid);


SET LOCAL app.locatario_id = 'UUID_DO_LOCATARIO';

await prisma.$executeRaw`
  select set_config('app.locatario_id', ${locatarioId}, true)
`;
