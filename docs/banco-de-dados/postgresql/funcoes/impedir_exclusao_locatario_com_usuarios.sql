CREATE OR REPLACE FUNCTION fn_impedir_exclusao_locatario_com_usuarios()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM usuarios
    WHERE locatario_id = OLD.id
      AND excluido_em IS NULL
  ) THEN
    RAISE EXCEPTION 'Não é permitido excluir locatário com usuários ativos';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

