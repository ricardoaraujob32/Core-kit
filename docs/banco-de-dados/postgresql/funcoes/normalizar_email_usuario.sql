-- =========================================================
-- util: normalizar email (usuarios)
-- =========================================================
CREATE OR REPLACE FUNCTION fn_normalizar_email_usuario()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email := lower(btrim(NEW.email));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;