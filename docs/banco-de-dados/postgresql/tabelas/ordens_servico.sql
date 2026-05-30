CREATE TABLE IF NOT EXISTS core.ordens_servico (
  ordem_servico_id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,

  cliente_id UUID NULL,

  status core.status_os NOT NULL DEFAULT 'ABERTA',

  titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
  descricao TEXT NULL,

  aberta_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  fechada_em TIMESTAMPTZ NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_ordens_servico') THEN
    ALTER TABLE ordens_servico
    ADD CONSTRAINT pk_ordens_servico
    PRIMARY KEY (locatario_id, ordem_servico_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_os_locatarios') THEN
    ALTER TABLE ordens_servico
    ADD CONSTRAINT fk_os_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(locatario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_os_clientes') THEN
    ALTER TABLE ordens_servico
    ADD CONSTRAINT fk_os_clientes
    FOREIGN KEY (locatario_id, cliente_id)
    REFERENCES clientes(locatario_id, cliente_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_os_locatario_status_criado
ON ordens_servico (locatario_id, status, criado_em DESC)
WHERE excluido_em IS NULL;

CREATE INDEX IF NOT EXISTS idx_os_locatario_cliente_criado
ON ordens_servico (locatario_id, cliente_id, criado_em DESC)
WHERE excluido_em IS NULL;

ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='ordens_servico' AND policyname='p_ordens_servico_tenant_estrito'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY p_ordens_servico_tenant_estrito
      ON ordens_servico
      TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
      USING (locatario_id = app_locatario_id())
      WITH CHECK (locatario_id = app_locatario_id())
    $sql$;
  END IF;
END;
$$;
