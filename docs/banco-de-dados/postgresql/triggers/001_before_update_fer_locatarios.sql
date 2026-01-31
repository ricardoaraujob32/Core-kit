CREATE TRIGGER tg_before_update_locatarios
BEFORE UPDATE ON locatarios
FOR EACH ROW EXECUTE FUNCTION fn_definir_atualizado_em();
