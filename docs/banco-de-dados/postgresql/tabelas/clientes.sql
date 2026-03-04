CREATE TABLE IF NOT EXISTS clientes (
  cliente_id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,

  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  documento TEXT NULL,
  email TEXT NULL CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'),
  telefone TEXT NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_clientes') THEN
    ALTER TABLE clientes
    ADD CONSTRAINT pk_clientes
    PRIMARY KEY (locatario_id, cliente_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_clientes_locatarios') THEN
    ALTER TABLE clientes
    ADD CONSTRAINT fk_clientes_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(locatario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_clientes_nome_ci
ON clientes (locatario_id, lower(nome))
WHERE excluido_em IS NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_locatario_criado_em
ON clientes (locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_clientes_documento
ON clientes (locatario_id, documento)
WHERE documento IS NOT NULL AND excluido_em IS NULL;

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='clientes' AND policyname='p_clientes_tenant_estrito'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_clientes_tenant_estrito
      ON clientes
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (locatario_id = app_locatario_id())
      WITH CHECK (locatario_id = app_locatario_id())
    $sql$;
  END IF;
END;
$$;