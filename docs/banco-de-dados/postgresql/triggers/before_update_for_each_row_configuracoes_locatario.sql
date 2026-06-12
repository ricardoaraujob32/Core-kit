CREATE TRIGGER tg_before_update_configuracoes_locatario
BEFORE UPDATE ON configuracoes_locatario
FOR EACH ROW EXECUTE FUNCTION fn_definir_atualizado_em();
