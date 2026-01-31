CREATE TABLE IF NOT EXISTS locatarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT NOT NULL,
  identificador   TEXT NOT NULL UNIQUE, -- usado para subdomínio/identificação
  status          TEXT NOT NULL DEFAULT 'ATIVO'
                  CHECK (status IN ('ATIVO','SUSPENSO','EXCLUIDO')),
  plano           TEXT NOT NULL DEFAULT 'GRATUITO'
                  CHECK (plano IN ('GRATUITO','BASICO','PRO','EMPRESARIAL')),
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

