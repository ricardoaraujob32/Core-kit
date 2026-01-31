CREATE TABLE IF NOT EXISTS permissoes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo    TEXT NOT NULL UNIQUE,
  nome      TEXT NOT NULL,
  descricao TEXT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

