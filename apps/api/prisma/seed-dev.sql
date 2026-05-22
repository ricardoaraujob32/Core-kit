-- apps/api/prisma/seed-dev.sql

-- =========================================================
-- CORE KIT - SEED DEV
-- =========================================================

BEGIN;

-- =========================================================
-- LOCATÁRIO
-- =========================================================

INSERT INTO core.locatarios (
  locatario_id,
  nome,
  slug,
  email,
  documento,
  fuso_horario,
  status,
  criado_em,
  atualizado_em
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Locatário Dev',
  'dev',
  'locatario@dev.local',
  '00000000000191',
  'America/Sao_Paulo',
  'ATIVO',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- CONFIGURAÇÃO ATIVA
-- =========================================================

INSERT INTO core.configuracoes_locatario (
  locatario_id,
  configuracao_id,
  modo_tema,
  identidade_visual,
  cor_primaria,
  cor_secundaria,
  cor_terciaria,
  url_logo,
  ativa,
  criado_em,
  atualizado_em
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'SISTEMA',
  'dev-padrao',
  '#2563eb',
  '#1e40af',
  '#f8fafc',
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- USUÁRIO PLATAFORMA
-- senha: 123456
-- hash bcrypt exemplo
-- =========================================================

INSERT INTO core.usuarios_plataforma (
  usuario_plataforma_id,
  email,
  senha_hash,
  nome,
  ativo,
  criado_em
)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'admin@corekit.dev',
  '$2b$10$wH7mPj5x0x5x5x5x5x5x5eB0nLQ9K4wXn4N6X0r8z0YxW1V1Qf8kS',
  'Administrador Plataforma',
  true,
  NOW()
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- USUÁRIO TENANT
-- senha: 123456
-- =========================================================

INSERT INTO core.usuarios (
  usuario_id,
  locatario_id,
  email,
  senha_hash,
  nome,
  status,
  criado_em
)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'admin@dev.local',
  '$2b$10$wH7mPj5x0x5x5x5x5x5x5eB0nLQ9K4wXn4N6X0r8z0YxW1V1Qf8kS',
  'Administrador Tenant',
  'ATIVO',
  NOW()
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- PAPÉIS
-- =========================================================

INSERT INTO core.papeis (
  papel_id,
  nome,
  descricao,
  criado_em
)
VALUES
(
  '55555555-5555-5555-5555-555555555551',
  'ADMIN',
  'Administrador',
  NOW()
),
(
  '55555555-5555-5555-5555-555555555552',
  'OPERADOR',
  'Operador',
  NOW()
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- PERMISSÕES
-- =========================================================

INSERT INTO core.permissoes (
  permissao_id,
  codigo,
  descricao,
  criado_em
)
VALUES
(
  '66666666-6666-6666-6666-666666666661',
  'TENANT_USUARIO_LISTAR',
  'Listar usuários',
  NOW()
),
(
  '66666666-6666-6666-6666-666666666662',
  'TENANT_CLIENTE_LISTAR',
  'Listar clientes',
  NOW()
),
(
  '66666666-6666-6666-6666-666666666663',
  'TENANT_PRODUTO_LISTAR',
  'Listar produtos',
  NOW()
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- PAPEL -> PERMISSÕES
-- =========================================================

INSERT INTO core.papel_permissoes (
  papel_permissao_id,
  papel_id,
  permissao_id,
  criado_em
)
VALUES
(
  '77777777-7777-7777-7777-777777777771',
  '55555555-5555-5555-5555-555555555551',
  '66666666-6666-6666-6666-666666666661',
  NOW()
),
(
  '77777777-7777-7777-7777-777777777772',
  '55555555-5555-5555-5555-555555555551',
  '66666666-6666-6666-6666-666666666662',
  NOW()
),
(
  '77777777-7777-7777-7777-777777777773',
  '55555555-5555-5555-5555-555555555551',
  '66666666-6666-6666-6666-666666666663',
  NOW()
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- USUÁRIO -> PAPEL
-- =========================================================

INSERT INTO core.usuarios_papeis (
  usuario_papel_id,
  usuario_id,
  papel_id,
  criado_em
)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555551',
  NOW()
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- CLIENTES
-- =========================================================

INSERT INTO core.clientes (
  cliente_id,
  locatario_id,
  nome,
  email,
  criado_em
)
VALUES
(
  '99999999-9999-9999-9999-999999999991',
  '11111111-1111-1111-1111-111111111111',
  'Cliente Teste 1',
  'cliente1@dev.local',
  NOW()
),
(
  '99999999-9999-9999-9999-999999999992',
  '11111111-1111-1111-1111-111111111111',
  'Cliente Teste 2',
  'cliente2@dev.local',
  NOW()
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- PRODUTOS
-- =========================================================

INSERT INTO core.produtos (
  produto_id,
  locatario_id,
  nome,
  preco,
  criado_em
)
VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  '11111111-1111-1111-1111-111111111111',
  'Produto Dev 1',
  100.00,
  NOW()
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  '11111111-1111-1111-1111-111111111111',
  'Produto Dev 2',
  250.00,
  NOW()
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- AUDITORIA
-- =========================================================

INSERT INTO audit.auditoria_locatario (
  auditoria_locatario_id,
  locatario_id,
  evento,
  sucesso,
  criado_em
)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'SEED_DEV_EXECUTADO',
  true,
  NOW()
)
ON CONFLICT DO NOTHING;

COMMIT;