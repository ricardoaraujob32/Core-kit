CREATE TABLE IF NOT EXISTS limites_plano (
  plano_id       UUID NOT NULL,
  chave          TEXT NOT NULL,
  valor_inteiro  INTEGER NULL,
  valor_texto    TEXT NULL,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_plano_limites PRIMARY KEY (plano_id, chave),
  CONSTRAINT fk_plano_limites_plano FOREIGN KEY (plano_id)
    REFERENCES app.planos(id) ON DELETE CASCADE,

  CONSTRAINT ck_plano_limites_chave CHECK (chave ~ '^[A-Z0-9_]+$'),
  CONSTRAINT ck_plano_limites_valor_inteiro CHECK (valor_inteiro IS NULL OR valor_inteiro >= 0)
);
