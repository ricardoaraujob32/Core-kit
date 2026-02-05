DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_locatarios_before_delete_for_each_row') THEN
    CREATE TRIGGER tg_locatarios_before_delete_for_each_row
    BEFORE DELETE ON locatarios
    FOR EACH ROW EXECUTE FUNCTION fn_locatarios_before_delete_for_each_row();
  END IF;
END $$;