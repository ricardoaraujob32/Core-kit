CREATE TABLE IF NOT EXISTS exportacoes (
  id                    UUID DEFAULT gen_random_uuid(),
  locatario_id          UUID NOT NULL,
  criado_por_usuario_id UUID NULL,
  formato               formato_exportacao NOT NULL,
  status                status_job NOT NULL DEFAULT 'PENDENTE',
  parametros            JSONB NOT NULL DEFAULT '{}'::jsonb, -- filtros, colunas, período etc.
  referencia_resultado  TEXT NULL, -- link/caminho do arquivo gerado
  mensagem_erro         TEXT NULL,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);
