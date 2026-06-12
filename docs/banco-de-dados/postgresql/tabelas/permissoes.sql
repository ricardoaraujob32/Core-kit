-- =========================================================
-- CATÁLOGO GLOBAL DE PERMISSÕES (RBAC)
--
-- Representa capacidades atômicas do sistema.
-- NÃO representa papéis, usuários ou grupos.
--
-- REGRAS IMPORTANTES:
-- - Permissões são globais (nível plataforma)
-- - NÃO dependem de locatário
-- - NÃO devem ser removidas fisicamente após uso
-- - Devem ser estáveis ao longo do tempo
--
-- EXEMPLOS:
-- - usuarios:criar
-- - locatarios:suspender
-- - financeiro:visualizar
-- =========================================================
CREATE TABLE IF NOT EXISTS core.permissoes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo    TEXT NOT NULL UNIQUE, -- Identificador técnico estável usado em regras. (modulo:acao)
  nome      TEXT NOT NULL, -- Nome amigável exibido em UI
  descricao TEXT NULL, -- Documentação humana / UI / auditoria
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

