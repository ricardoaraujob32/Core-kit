-- =========================================================
-- util: pegar variáveis de sessão definidas pelo backend
-- =========================================================
CREATE OR REPLACE FUNCTION fn_configuracoes_app(chave text)
RETURNS text AS $$
BEGIN
  RETURN current_setting(chave, true);
END;
$$ LANGUAGE plpgsql;