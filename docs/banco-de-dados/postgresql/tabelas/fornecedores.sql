-- FORNECEDORES
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,
  nome TEXT NOT NULL,
  documento TEXT NULL,
  email TEXT NULL,
  telefone TEXT NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL,

  CONSTRAINT pk_fornecedores PRIMARY KEY (locatario_id, id),
  CONSTRAINT uq_fornecedores_nome UNIQUE (locatario_id, nome)
);