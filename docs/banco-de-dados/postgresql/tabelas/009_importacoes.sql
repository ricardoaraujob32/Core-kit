CREATE TABLE IF NOT EXISTS importacoes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  locatario_id      UUID NOT NULL
                    REFERENCES locatarios(id) ON DELETE CASCADE,

  criado_por_usuario_id UUID NULL
                    REFERENCES usuarios(id) ON DELETE SET NULL,

  tipo_origem       tipo_origem_importacao NOT NULL,

  referencia_origem TEXT NULL, -- caminho/URL/id do arquivo/planilha

  status            status_trabalho NOT NULL DEFAULT 'PENDENTE',

  mapeamento_colunas JSONB NOT NULL DEFAULT '{}'::jsonb, -- mapeamento do arquivo -> campos do sistema
  estatisticas       JSONB NOT NULL DEFAULT '{}'::jsonb, -- contagens, erros, métricas etc.

  mensagem_erro     TEXT NULL,

  iniciado_em       TIMESTAMPTZ NULL,
  finalizado_em     TIMESTAMPTZ NULL,

  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_importacao_locatario_criado_em
  ON importacoes(locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_importacao_status
  ON importacoes(status);

