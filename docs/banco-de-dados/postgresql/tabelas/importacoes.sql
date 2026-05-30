CREATE TABLE IF NOT EXISTS core.importacoes (
  importacao_id         UUID DEFAULT gen_random_uuid(),
  locatario_id          UUID NOT NULL,
  criado_por_usuario_id UUID NULL,
  tipo_origem           jobs.tipo_origem_importacao NOT NULL,
  referencia_origem     TEXT NULL, -- caminho/URL/id do arquivo/planilha
  status                jobs.status_job NOT NULL DEFAULT 'PENDENTE',
  mapeamento_colunas    JSONB NOT NULL DEFAULT '{}'::jsonb, -- mapeamento do arquivo -> campos do sistema
  estatisticas          JSONB NOT NULL DEFAULT '{}'::jsonb, -- contagens, erros, métricas etc.
  mensagem_erro         TEXT NULL,
  iniciado_em           TIMESTAMPTZ NULL,
  finalizado_em         TIMESTAMPTZ NULL,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_importacoes') THEN
    ALTER TABLE importacoes
    ADD CONSTRAINT pk_importacoes
    PRIMARY KEY (id, locatario_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_importacoes_locatarios') THEN
    ALTER TABLE importacoes
    ADD CONSTRAINT fk_importacoes_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_importacoes_usuarios') THEN
    ALTER TABLE importacoes
    ADD CONSTRAINT fk_importacoes_usuarios
    FOREIGN KEY (criado_por_usuario_id)
    REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_importacao_locatario_criado_em
  ON importacoes(locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_importacao_status
  ON importacoes(status);
