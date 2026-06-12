CREATE TRIGGER tg_before_update_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION fn_definir_atualizado_em();
