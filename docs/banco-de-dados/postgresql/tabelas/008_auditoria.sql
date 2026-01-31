CREATE TABLE IF NOT EXISTS auditoria (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locatario_id         UUID NULL REFERENCES locatarios(id) ON DELETE CASCADE,
  usuario_executor_id  UUID NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  acao                 TEXT NOT NULL,
  tipo_entidade        TEXT NULL,
  entidade_id          UUID NULL,
  requisicao_id        TEXT NULL,
  endereco_ip          TEXT NULL,
  agente_usuario       TEXT NULL,
  metadados            JSONB NOT NULL DEFAULT '{}'::jsonb,
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now()
);


