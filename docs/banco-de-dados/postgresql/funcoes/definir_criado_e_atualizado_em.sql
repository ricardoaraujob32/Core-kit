-- =========================================================
-- util: timestamps
-- =========================================================
CREATE OR REPLACE FUNCTION fn_definir_criado_e_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.criado_em IS NULL THEN NEW.criado_em := now(); END IF;
    NEW.atualizado_em := now();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.atualizado_em := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;