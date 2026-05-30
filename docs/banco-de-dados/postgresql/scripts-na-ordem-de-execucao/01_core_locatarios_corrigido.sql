CREATE TABLE IF NOT EXISTS core.locatarios (
  locatario_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                       TEXT NOT NULL, -- Nome comercial exibido no sistema
  slug                       TEXT NOT NULL, -- Identidade externa estável (subdomínio / URL pública)
  documento                  TEXT NULL,  -- CNPJ, CPF, etc
  email                      TEXT NOT NULL CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'),
  fuso_horario               TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  status                     core.status_locatario NOT NULL DEFAULT 'ATIVO', -- Controla acesso do tenant, NÃO é soft delete
  excluido_em                TIMESTAMPTZ NULL, -- Exclusão lógica; registros nunca são removidos fisicamente
  motivo_exclusao            TEXT NULL, -- Motivo administrativo para exclusão, se aplicável
  suspenso_em                TIMESTAMPTZ NULL, -- Suspensão; bloqueia autenticação/uso, mas preserva tudo
  motivo_suspensao           TEXT NULL, -- Motivo administrativo para suspensão, se aplicável
  reativado_em               TIMESTAMPTZ NULL, -- Reativação; muda o status para ATIVO
  motivo_reativacao          TEXT NULL, -- Motivo administrativo para reativação, se aplicável
  criado_em                  TIMESTAMPTZ NOT NULL DEFAULT now(), -- para auditoria
  atualizado_em              TIMESTAMPTZ NOT NULL DEFAULT now() -- atualizado por trigger
);

CREATE TABLE IF NOT EXISTS core.configuracoes_locatario (
  locatario_id       UUID NOT NULL,
  configuracao_id    UUID NOT NULL,
  modo_tema          TEXT NOT NULL DEFAULT 'SISTEMA' CHECK (modo_tema IN ('CLARO','ESCURO','SISTEMA')),
  identidade_visual  TEXT UNIQUE NOT NULL CHECK(length(trim(identidade_visual))>0), -- nome da identidade (padrão, natal, ano novo, etc)
  cor_primaria       TEXT NULL, -- ex: "#3B82F6"
  cor_secundaria     TEXT NULL, -- ex: "#3B82F6"
  cor_terciaria      TEXT NULL, -- ex: "#3B82F6"
  url_logo           TEXT NULL, -- logomarca da empresa
  ativa              BOOLEAN NOT NULL DEFAULT FALSE, -- somente 1 configuração ativa por locatário;
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now()  -- atualizado por trigger
);

CREATE TABLE IF NOT EXISTS core.usuarios_plataforma (
  usuario_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locatario_id               UUID NULL, -- NULL indica usuário de nível plataforma (ex.: superadmin)
  email                      TEXT NOT NULL,
  nome                       TEXT NOT NULL,
  senha_hash                 TEXT NOT NULL,
  status                     core.status_usuario NOT NULL DEFAULT 'ATIVO',
  ultimo_login_em            TIMESTAMPTZ NULL, -- atualizado por trigger
  criado_em                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por_usuario_id      UUID NULL,
  atualizado_em              TIMESTAMPTZ NOT NULL DEFAULT now(), -- atualizado por trigger
  atualizado_por_usuario_id  UUID NULL,
  excluido_em                TIMESTAMPTZ NULL,
  excluido_por_usuario_id    UUID NULL,
  motivo_exclusao            TEXT NULL
);

CREATE TABLE IF NOT EXISTS core.usuarios (
  usuario_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locatario_id               UUID NULL, -- NULL indica usuário de nível plataforma (ex.: superadmin)
  email                      TEXT NOT NULL,
  nome                       TEXT NOT NULL,
  senha_hash                 TEXT NOT NULL,
  status                     core.status_usuario NOT NULL DEFAULT 'ATIVO',
  ultimo_login_em            TIMESTAMPTZ NULL, -- atualizado por trigger
  criado_em                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por_usuario_id      UUID NULL,
  atualizado_em              TIMESTAMPTZ NOT NULL DEFAULT now(), -- atualizado por trigger
  atualizado_por_usuario_id  UUID NULL,
  excluido_em                TIMESTAMPTZ NULL,
  excluido_por_usuario_id    UUID NULL,
  motivo_exclusao            TEXT NULL
);

CREATE TABLE IF NOT EXISTS core.tokens_plataforma (
  token_id             UUID NOT NULL DEFAULT gen_random_uuid(),
  usuario_id           UUID NOT NULL,
  locatario_id         UUID NOT NULL, -- NULL indica usuário de nível plataforma (ex.: superadmin)
  hash_token           TEXT UNIQUE NOT NULL, -- nunca guarde o token em claro
  tipo                 core.tipo_token NOT NULL, -- access / refresh / etc.
  emitido_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em            TIMESTAMPTZ NOT NULL,
  revogado_em          TIMESTAMPTZ NULL,
  proximo_token_id     UUID NULL, -- id do novo token (rotação)
  proximo_usuario_id   UUID NULL,
  proximo_locatario_id UUID NULL,
  agente_usuario       TEXT NULL,
  endereco_ip          INET NULL
);

CREATE TABLE IF NOT EXISTS core.tokens_locatario (
  token_id             UUID NOT NULL DEFAULT gen_random_uuid(),
  usuario_id           UUID NOT NULL,
  locatario_id         UUID NOT NULL, -- NULL indica usuário de nível plataforma (ex.: superadmin)
  hash_token           TEXT UNIQUE NOT NULL, -- nunca guarde o token em claro
  tipo                 core.tipo_token NOT NULL, -- access / refresh / etc.
  emitido_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em            TIMESTAMPTZ NOT NULL,
  revogado_em          TIMESTAMPTZ NULL,
  proximo_token_id     UUID NULL, -- id do novo token (rotação)
  proximo_usuario_id   UUID NULL,
  proximo_locatario_id UUID NULL,
  agente_usuario       TEXT NULL,
  endereco_ip          INET NULL
);

CREATE TABLE IF NOT EXISTS core.papeis (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        TEXT NOT NULL UNIQUE, -- Identificador técnico estável
  nome          TEXT NOT NULL,  -- Nome amigável exibido em UI
  descricao     TEXT NULL, -- Documentação humana / UI / auditoria
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 0) Seed de papéis mínimos (se ainda não existirem)
-- ============================================================
--DO $$
--BEGIN
--  IF NOT EXISTS (SELECT 1 FROM papeis WHERE nome = 'SUPERADMIN') THEN
--    INSERT INTO papeis (id, codigo, nome, descricao, criado_em, atualizado_em)
--    VALUES (gen_random_uuid(), 'SUPERADMIN', 'Administrador do complexo', 'Acesso total à plataforma (singleton).', now(), now());
--  END IF;

--  IF NOT EXISTS (SELECT 1 FROM papeis WHERE nome = 'ADMIN') THEN
--    INSERT INTO papeis (id, codigo, nome, descricao, criado_em, atualizado_em)
--    VALUES (gen_random_uuid(), 'ADMIN', 'Administrador do locatário', 'Administrador do locatário (no máximo 1 por locatário).', now(), now());
--  END IF;

--  IF NOT EXISTS (SELECT 1 FROM papeis WHERE nome = 'GERENTE') THEN
--    INSERT INTO papeis (id, codigo, nome, descricao, criado_em, atualizado_em)
--    VALUES (gen_random_uuid(), 'GERENTE', 'Gerente', 'Gerente do locatário.', now(), now());
--  END IF;

--  IF NOT EXISTS (SELECT 1 FROM papeis WHERE nome = 'OPERADOR') THEN
--    INSERT INTO papeis (id, codigo, nome, descricao, criado_em, atualizado_em)
--    VALUES (gen_random_uuid(), 'OPERADOR', 'Operador', 'Operador do locatário.', now(), now());
--  END IF;
--END;
--$$;





-- ============================================================
-- Proteção de papéis canônicos (não renomear / não deletar)
-- ============================================================

CREATE OR REPLACE FUNCTION trg_papeis_proteger_canonicos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Bloqueia DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.nome IN ('SUPERADMIN','ADMIN','GERENTE','OPERADOR') THEN
      RAISE EXCEPTION 'papel canônico não pode ser removido: %', OLD.nome;
    END IF;
    RETURN OLD;
  END IF;

  -- Bloqueia renomear (UPDATE nome)
  IF TG_OP = 'UPDATE' THEN
    IF OLD.nome IN ('SUPERADMIN','ADMIN','GERENTE','OPERADOR')
       AND NEW.nome IS DISTINCT FROM OLD.nome THEN
      RAISE EXCEPTION 'papel canônico não pode ser renomeado: %', OLD.nome;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS core.permissoes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo    TEXT NOT NULL UNIQUE, -- Identificador técnico estável usado em regras. (modulo:acao)
  nome      TEXT NOT NULL, -- Nome amigável exibido em UI
  descricao TEXT NULL, -- Documentação humana / UI / auditoria
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.papel_permissoes (
  papel_id      UUID NOT NULL,
  permissao_id  UUID NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.usuarios_papeis_plataforma (
  usuario_id          UUID NOT NULL,
  papel_id            UUID NOT NULL,
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.usuarios_papeis (
  usuario_id          UUID NOT NULL,
  locatario_id        UUID NOT NULL,
  papel_id            UUID NOT NULL,
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.planos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        TEXT NOT NULL UNIQUE CHECK (codigo ~ '^[A-Z0-9_]+$'),
  nome          TEXT NOT NULL, -- Nome comercial do plano
  ativo         BOOLEAN NOT NULL DEFAULT TRUE, -- Controle administrativo
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE core.locatarios OWNER TO posse;

ALTER TABLE core.configuracoes_locatario OWNER TO posse;

ALTER TABLE core.usuarios_plataforma OWNER TO posse;

ALTER TABLE core.usuarios OWNER TO posse;

ALTER TABLE core.tokens_plataforma OWNER TO posse;

ALTER TABLE core.tokens_locatario OWNER TO posse;

ALTER TABLE core.papeis OWNER TO posse;

ALTER TABLE core.permissoes OWNER TO posse;

ALTER TABLE core.papel_permissoes OWNER TO posse;

ALTER TABLE core.usuarios_papeis_plataforma OWNER TO posse;

ALTER TABLE core.usuarios_papeis OWNER TO posse;

ALTER TABLE core.planos OWNER TO posse;
