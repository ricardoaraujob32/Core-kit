CREATE TABLE IF NOT EXISTS core.modulos_locatario (
  locatario_id UUID NOT NULL,
  modulo_id UUID NOT NULL,

  habilitado BOOLEAN NOT NULL DEFAULT TRUE,

  origem core.origem_plano NOT NULL DEFAULT 'PLANO',

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_modulos_locatario
    PRIMARY KEY (locatario_id, modulo_id),

  CONSTRAINT fk_modulos_locatario_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(locatario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_modulos_locatario_modulos
    FOREIGN KEY (modulo_id)
    REFERENCES modulos(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_modulos_locatario_locatario
ON modulos_locatario (locatario_id);

CREATE INDEX IF NOT EXISTS idx_modulos_locatario_modulo
ON modulos_locatario (modulo_id);

CREATE INDEX IF NOT EXISTS idx_modulos_locatario_habilitado
ON modulos_locatario (locatario_id, habilitado);

ALTER TABLE modulos_locatario ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_modulos_locatario
ON modulos_locatario
USING (locatario_id = app_locatario_id())
WITH CHECK (locatario_id = app_locatario_id());
