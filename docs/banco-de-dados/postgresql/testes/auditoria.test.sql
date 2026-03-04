-- A) Usuário comum (tenant) consegue inserir em auditoria_locatario

BEGIN;

-- contexto de usuário comum (tenant)
SELECT app_definir_contexto('USER_TENANT_A', 'LOCATARIO_A', false);

INSERT INTO auditoria_locatario (
  locatario_id, usuario_id, evento, sucesso, entidade_tipo, entidade_id, metadados
)
VALUES (
  'LOCATARIO_A', 'USER_TENANT_A',
  'cliente.criado', true,
  'clientes', '{clientes:CLIENTE_1}',
  '{"depois":{"cliente_id":"CLIENTE_1"}}'::jsonb
);

-- deve retornar 1 linha
SELECT * FROM auditoria_locatario WHERE locatario_id = 'LOCATARIO_A' ORDER BY criado_em DESC LIMIT 1;

ROLLBACK;

-- B) Usuário comum não consegue inserir auditoria_locatario com locatário diferente (trigger P3)

BEGIN;

SELECT app_definir_contexto('USER_TENANT_A', 'LOCATARIO_A', false);

-- deve falhar (locatario_id difere do contexto)
INSERT INTO auditoria_locatario (locatario_id, usuario_id, evento, sucesso)
VALUES ('LOCATARIO_B', 'USER_TENANT_A', 'teste', true);

ROLLBACK;

-- C) Usuário comum não consegue inserir em auditoria_plataforma (trigger P3)

BEGIN;

SELECT app_definir_contexto('USER_TENANT_A', 'LOCATARIO_A', false);

-- deve falhar (exige app_is_plataforma=true)
INSERT INTO auditoria_plataforma (usuario_id, evento, sucesso)
VALUES ('USER_TENANT_A', 'tentativa.admin', false);

ROLLBACK;

-- D) SUPERADMIN em modo plataforma consegue inserir em auditoria_plataforma

BEGIN;

SELECT app_definir_contexto('SUPERADMIN_ID', NULL, true);

INSERT INTO auditoria_plataforma (
  usuario_id, locatario_alvo_id, evento, sucesso, metadados
)
VALUES (
  'SUPERADMIN_ID', NULL,
  'locatario.criado', true,
  '{"motivo":"onboarding"}'::jsonb
);

SELECT * FROM auditoria_plataforma ORDER BY criado_em DESC LIMIT 1;

ROLLBACK;

-- E) SUPERADMIN com locatário selecionado grava em auditoria_plataforma com alvo preenchido

BEGIN;

SELECT app_definir_contexto('SUPERADMIN_ID', 'LOCATARIO_A', true);

-- locatario_alvo_id pode ser omitido (trigger preenche pelo contexto)
INSERT INTO auditoria_plataforma (
  usuario_id, evento, sucesso, entidade_tipo, entidade_id
)
VALUES (
  'SUPERADMIN_ID', 'usuario.reset_senha', true, 'usuarios', '{usuarios:USER_TENANT_A}'
);

SELECT * FROM auditoria_plataforma ORDER BY criado_em DESC LIMIT 1;

ROLLBACK;

-- F) Imutabilidade: UPDATE/DELETE devem falhar em ambas

BEGIN;

SELECT app_definir_contexto('USER_TENANT_A', 'LOCATARIO_A', false);

-- faz um insert de teste
INSERT INTO auditoria_locatario (locatario_id, usuario_id, evento, sucesso)
VALUES ('LOCATARIO_A', 'USER_TENANT_A', 'teste.immut', true);

-- deve falhar
UPDATE auditoria_locatario SET evento = 'x'
WHERE locatario_id='LOCATARIO_A' ORDER BY criado_em DESC LIMIT 1;

-- deve falhar
DELETE FROM auditoria_locatario
WHERE locatario_id='LOCATARIO_A' ORDER BY criado_em DESC LIMIT 1;

ROLLBACK;