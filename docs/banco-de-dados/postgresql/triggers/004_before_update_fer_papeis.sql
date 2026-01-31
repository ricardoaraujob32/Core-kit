CREATE TRIGGER tg_before_update_papeis
BEFORE UPDATE ON papeis
FOR EACH ROW EXECUTE FUNCTION fn_definir_atualizado_em();
