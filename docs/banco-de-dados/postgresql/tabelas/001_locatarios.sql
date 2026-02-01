CREATE TABLE IF NOT EXISTS locatarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE, -- usado para subdomínio/identificação
  status          status_locatario NOT NULL DEFAULT 'ATIVO',
  plano           planos_locatario NOT NULL DEFAULT 'GRATUITO',
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
