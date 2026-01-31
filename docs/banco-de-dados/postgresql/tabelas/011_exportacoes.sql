CREATE TABLE IF NOT EXISTS exportacoes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  locatario_id          UUID NOT NULL
                        REFERENCES locatarios(id) ON DELETE CASCADE,

  criado_por_usuario_id UUID NULL
                        REFERENCES usuarios(id) ON DELETE SET NULL,

  formato               formato_exportacao NOT NULL,

  status                status_trabalho NOT NULL DEFAULT 'PENDENTE',

  parametros            JSONB NOT NULL DEFAULT '{}'::jsonb, -- filtros, colunas, período etc.
  referencia_resultado  TEXT NULL, -- link/caminho do arquivo gerado

  mensagem_erro         TEXT NULL,

  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exportacoes_locatario_criado_em
  ON exportacoes (locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_exportacoes_status
  ON exportacoes (status);

