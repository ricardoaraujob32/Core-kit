CREATE TABLE IF NOT EXISTS configuracoes_locatario (
  locatario_id    UUID NOT NULL,
  configuracao_id UUID NOT NULL,
  modo_tema       TEXT NOT NULL DEFAULT 'SISTEMA'
                  CHECK (modo_tema IN ('CLARO','ESCURO','SISTEMA')),
  cor_primaria    TEXT NULL, -- ex: "#3B82F6"
  cor_secundaria  TEXT NULL, -- ex: "#3B82F6"
  cor_terciaria   TEXT NULL, -- ex: "#3B82F6"
  url_logo        TEXT NULL,
  email_suporte   TEXT NULL CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'),
  fuso_horario    TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  idioma          TEXT NOT NULL DEFAULT 'pt-BR',
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
