CREATE OR REPLACE FUNCTION fn_validar_locatario_usuario_papel()
RETURNS TRIGGER AS $$
DECLARE
  locatario_usuario UUID;
BEGIN
  SELECT locatario_id INTO locatario_usuario
  FROM usuarios
  WHERE id = NEW.usuario_id;

  IF NEW.locatario_id IS NOT NULL
     AND locatario_usuario IS NOT NULL
     AND NEW.locatario_id <> locatario_usuario THEN
    RAISE EXCEPTION 'Usuário e papel pertencem a locatários diferentes';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_role_tenant
BEFORE INSERT OR UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION enforce_same_tenant_user_role();
