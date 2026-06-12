-- criar índices
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '') THEN
    
  END IF;
END;
$$;


-- criar triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = '') THEN
  
  END IF;
END $$;

-- criar índices parciais
CREATE INDEX 
ON    ( DESC)
WHERE     IS NULL;