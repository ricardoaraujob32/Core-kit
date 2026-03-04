-- =========================================================
-- USUÁRIOS DO SISTEMA
--
-- Representa identidades autenticáveis.
--
-- REGRAS IMPORTANTES:
-- - Usuário pode pertencer a um locatário
-- - Superadmin pode NÃO ter locatario_id (nível plataforma)
-- - Exclusão deve ser lógica se houver vínculos
--
-- SEGURANÇA:
-- - NÃO armazenar senhas em texto puro
-- - Hash/salt devem ser aplicados na camada de aplicação
-- =========================================================
CREATE TABLE IF NOT EXISTS usuarios (
  usuario_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locatario_id               UUID NULL, -- NULL indica usuário de nível plataforma (ex.: superadmin)
  email                      TEXT NOT NULL,
  nome                       TEXT NOT NULL,
  senha_hash                 TEXT NOT NULL,
  status                     status_usuario NOT NULL DEFAULT 'ATIVO',
  ultimo_login_em            TIMESTAMPTZ NULL, -- atualizado por trigger
  criado_em                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por_usuario_id      UUID NULL,
  atualizado_em              TIMESTAMPTZ NOT NULL DEFAULT now(), -- atualizado por trigger
  atualizado_por_usuario_id  UUID NULL,
  excluido_em                TIMESTAMPTZ NULL,
  excluido_por_usuario_id    UUID NULL,
  motivo_exclusao            TEXT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_locatarios') THEN
    ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuarios_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios(locatario_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_criado_por_usuario') THEN
    ALTER TABLE usuarios
    ADD CONSTRAINT IF NOT EXISTS fk_usuarios_criado_por_usuario
    FOREIGN KEY (criado_por_usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_atualizado_por_usuario') THEN
    ALTER TABLE usuarios
    ADD CONSTRAINT IF NOT EXISTS fk_usuarios_atualizado_por_usuario
    FOREIGN KEY (atualizado_por_usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_excluido_por_usuario') THEN
    ALTER TABLE usuarios
    ADD CONSTRAINT IF NOT EXISTS fk_usuarios_excluido_por_usuario
    FOREIGN KEY (excluido_por_usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_usuarios_locatario_excluido_em
  ON usuarios(locatario_id, excluido_em);

-- (recomendado) email único por locatário somente para usuários ATIVOS (soft delete friendly)
-- Ajuste o nome da coluna email se for diferente.
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_locatario_email_ativo
ON usuarios(locatario_id, lower(email))
WHERE excluido_em IS NULL AND locatario_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_plataforma_email_ativo
ON usuarios(lower(email)) WHERE excluido_em IS NULL AND locatario_id IS NULL

CREATE INDEX IF NOT EXISTS idx_usuarios_locatario
  ON usuarios(locatario_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_status
  ON usuarios(status);


-- ============================================================
-- 1) Unicidade de email (tenant vs plataforma)
-- ============================================================

-- (1a) Usuários de locatário: e-mail único por locatário (ativos)
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email_por_locatario_ativo
ON usuarios (locatario_id, lower(email))
WHERE excluido_em IS NULL AND locatario_id IS NOT NULL;

-- (1b) Usuários de plataforma: e-mail único global (ativos) quando locatario_id IS NULL
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email_plataforma_ativo
ON usuarios (lower(email))
WHERE excluido_em IS NULL AND locatario_id IS NULL;

-- (opcional mas recomendado) índices de apoio
CREATE INDEX IF NOT EXISTS idx_usuarios_locatario_excluido
ON usuarios (locatario_id, excluido_em);

CREATE INDEX IF NOT EXISTS idx_usuarios_status
ON usuarios (status);
