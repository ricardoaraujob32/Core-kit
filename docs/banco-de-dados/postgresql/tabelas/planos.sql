CREATE TABLE IF NOT EXISTS planos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        TEXT NOT NULL,
  nome          TEXT NOT NULL,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()

  CONSTRAINT uq_planos_codigo UNIQUE (codigo),
  CONSTRAINT ck_planos_codigo CHECK (codigo ~ '^[A-Z0-9_]+$')
);
