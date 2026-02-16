-- ESTOQUES (depósitos)
CREATE TABLE IF NOT EXISTS estoques (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,
  nome TEXT NOT NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL,

  CONSTRAINT pk_estoques PRIMARY KEY (locatario_id, id),
  CONSTRAINT uq_estoques_nome UNIQUE (locatario_id, nome)
);



-- ESTOQUES
CREATE TABLE IF NOT EXISTS estoques (
  locatario_id UUID NOT NULL,
  id UUID NOT NULL DEFAULT gen_random_uuid(),

  nome TEXT NOT NULL,
  padrao BOOLEAN NOT NULL DEFAULT false,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL,

  CONSTRAINT pk_estoques PRIMARY KEY (locatario_id, id),
  CONSTRAINT uq_estoques_nome UNIQUE (locatario_id, nome)
);

-- Regra importante (sem trigger): garantir no máximo 1 estoque padrão por locatário
CREATE UNIQUE INDEX IF NOT EXISTS uq_estoques_padrao_por_locatario
ON estoques(locatario_id)
WHERE padrao = true AND excluido_em IS NULL;

