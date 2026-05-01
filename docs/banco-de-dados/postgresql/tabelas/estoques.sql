-- ESTOQUES (depósitos) 
CREATE TABLE IF NOT EXISTS estoques (
  locatario_id UUID NOT NULL,
  estoque_id UUID NOT NULL DEFAULT gen_random_uuid(),

  nome TEXT NOT NULL,
  padrao BOOLEAN NOT NULL DEFAULT true, -- apenas 1 estoque por locatário, ativado automaticamente

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(), -- atualizado por trigger
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

ALTER TABLE estoques ADD CONSTRAINT pk_estoques PRIMARY KEY (locatario_id, estoque_id);

ALTER TABLE estoques ADD CONSTRAINT fk_estoques_locatarios
FOREIGN KEY (locatario_id) REFERENCES locatarios(locatario_id)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE ADD CONSTRAINT uq_estoques_nome UNIQUE (locatario_id, nome);

CREATE UNIQUE INDEX IF NOT EXISTS uq_estoques_nome
ON estoques(locatario_id, nome) WHERE excluido_em IS NULL;

-- Regra importante (sem trigger): garantir no máximo 1 estoque padrão por locatário
CREATE UNIQUE INDEX IF NOT EXISTS uq_estoques_padrao_por_locatario
ON estoques(locatario_id) WHERE padrao = true AND excluido_em IS NULL;

