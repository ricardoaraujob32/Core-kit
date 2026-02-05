CREATE TABLE IF NOT EXISTS modulos_plano (
  plano_id   UUID NOT NULL,
  modulo_id  UUID NOT NULL,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE,

  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_plano_modulos PRIMARY KEY (plano_id, modulo_id),
  CONSTRAINT fk_plano_modulos_plano FOREIGN KEY (plano_id)
    REFERENCES app.planos(id) ON DELETE CASCADE,
  CONSTRAINT fk_plano_modulos_modulo FOREIGN KEY (modulo_id)
    REFERENCES app.modulos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_plano_modulos_modulo
  ON app.plano_modulos (modulo_id);
