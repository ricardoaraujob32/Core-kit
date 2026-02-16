-- CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,
  nome TEXT NOT NULL,
  documento TEXT NULL, -- CPF/CNPJ ou equivalente
  email TEXT NULL,
  telefone TEXT NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL,

  CONSTRAINT pk_clientes PRIMARY KEY (locatario_id, id),
  CONSTRAINT uq_clientes_nome UNIQUE (locatario_id, nome)
);