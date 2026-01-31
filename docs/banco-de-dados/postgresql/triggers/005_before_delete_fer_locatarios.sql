CREATE TRIGGER tg_before_delete_fer_locatarios
BEFORE DELETE ON locatarios
FOR EACH ROW EXECUTE FUNCTION fn_impedir_exclusao_locatario_com_usuarios();
