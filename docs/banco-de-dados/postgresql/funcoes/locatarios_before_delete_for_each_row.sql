CREATE OR REPLACE FUNCTION fn_locatarios_before_delete_for_each_row()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;