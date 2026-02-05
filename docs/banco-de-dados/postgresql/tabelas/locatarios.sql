CREATE TABLE IF NOT EXISTS locatarios (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                       TEXT NOT NULL,
  plano_id                   UUID NOT NULL,
  excluido_em                TIMESTAMPTZ NULL,
  excluido_por_usuario_id    UUID NULL,
  motivo_exclusao            TEXT NULL,
  slug                       TEXT NOT NULL UNIQUE, -- usado para subdomínio/identificação
  status                     status_locatario NOT NULL DEFAULT 'ATIVO',
  criado_em                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em              TIMESTAMPTZ NOT NULL DEFAULT now()
);
