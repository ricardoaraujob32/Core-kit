CREATE TABLE IF NOT EXISTS app.modulos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      TEXT NOT NULL,
  nome        TEXT NOT NULL,
  categoria   TEXT NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_modulos_codigo UNIQUE (codigo),
  CONSTRAINT ck_modulos_codigo CHECK (codigo ~ '^[A-Z0-9_]+$'),
  CONSTRAINT ck_modulos_categoria CHECK (categoria IN (
    'NUCLEO', 'OPERACIONAL', 'DADOS', 'IA', 'INTEGRACAO', 'RELATORIO'
  ))
);
