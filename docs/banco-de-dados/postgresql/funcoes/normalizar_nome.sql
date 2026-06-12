CREATE OR REPLACE FUNCTION fn_normalizar_nome()
RETURNS TRIGGER AS $$
BEGIN
  -- timestamps
  PERFORM 1;
  -- normalizações simples
  IF NEW.nome IS NOT NULL THEN
    NEW.nome := btrim(NEW.nome);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
