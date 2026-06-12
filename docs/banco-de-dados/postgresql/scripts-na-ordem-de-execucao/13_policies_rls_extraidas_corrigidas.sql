-- ============================================================
-- 13_policies_rls_extraidas_corrigidas.sql
-- Policies extraídas e compatibilizadas com o modelo atual
--
-- Pré-requisito:
-- - 11_funcoes_extraidas_corrigidas.sql já executado
--
-- Escopo:
-- - ENABLE ROW LEVEL SECURITY
-- - CREATE POLICY
--
-- Observações:
-- - usuarios_plataforma, tokens_plataforma e auditoria_plataforma ficam acessíveis
--   somente em contexto PLATAFORMA.
-- - tabelas tenant-scoped usam api.rls_tenant_read/write(locatario_id).
-- - produtos_estoque foi removida; usa-se core.movimentacoes_estoque.
-- - tokens genérico foi removido; usa-se core.tokens_locatario.
-- ============================================================

SET search_path TO core, audit, jobs, api, public;

-- ============================================================
-- 1) Tabelas de plataforma
-- ============================================================

ALTER TABLE core.usuarios_plataforma ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_usuarios_plataforma_only
ON core.usuarios_plataforma
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_platform())
WITH CHECK (api.rls_platform());

ALTER TABLE core.tokens_plataforma ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_tokens_plataforma_only
ON core.tokens_plataforma
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_platform())
WITH CHECK (api.rls_platform());

ALTER TABLE core.usuarios_papeis_plataforma ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_usuarios_papeis_plataforma_only
ON core.usuarios_papeis_plataforma
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_platform())
WITH CHECK (api.rls_platform());

ALTER TABLE audit.auditoria_plataforma ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_auditoria_plataforma_only
ON audit.auditoria_plataforma
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_platform())
WITH CHECK (api.rls_platform());

-- ============================================================
-- 2) Tabelas globais de catálogo/RBAC
-- ============================================================

ALTER TABLE core.papeis ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_papeis_read
ON core.papeis
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (true)
WITH CHECK (false);

CREATE POLICY p_papeis_migrador_write
ON core.papeis
TO multilocatario_migrador
USING (true)
WITH CHECK (true);

ALTER TABLE core.permissoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_permissoes_read
ON core.permissoes
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (true)
WITH CHECK (false);

CREATE POLICY p_permissoes_migrador_write
ON core.permissoes
TO multilocatario_migrador
USING (true)
WITH CHECK (true);

ALTER TABLE core.papel_permissoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_papel_permissoes_read
ON core.papel_permissoes
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (true)
WITH CHECK (false);

CREATE POLICY p_papel_permissoes_migrador_write
ON core.papel_permissoes
TO multilocatario_migrador
USING (true)
WITH CHECK (true);

ALTER TABLE core.planos ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_planos_read
ON core.planos
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (true)
WITH CHECK (false);

CREATE POLICY p_planos_migrador_write
ON core.planos
TO multilocatario_migrador
USING (true)
WITH CHECK (true);

ALTER TABLE core.modulos ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_modulos_read
ON core.modulos
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (true)
WITH CHECK (false);

CREATE POLICY p_modulos_migrador_write
ON core.modulos
TO multilocatario_migrador
USING (true)
WITH CHECK (true);

ALTER TABLE core.modulos_plano ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_modulos_plano_read
ON core.modulos_plano
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (true)
WITH CHECK (false);

CREATE POLICY p_modulos_plano_migrador_write
ON core.modulos_plano
TO multilocatario_migrador
USING (true)
WITH CHECK (true);

ALTER TABLE core.limites_plano ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_limites_plano_read
ON core.limites_plano
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (true)
WITH CHECK (false);

CREATE POLICY p_limites_plano_migrador_write
ON core.limites_plano
TO multilocatario_migrador
USING (true)
WITH CHECK (true);

-- ============================================================
-- 3) Locatários
-- ============================================================

ALTER TABLE core.locatarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY p_locatarios_plataforma_all
ON core.locatarios
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_platform())
WITH CHECK (api.rls_platform());

CREATE POLICY p_locatarios_tenant_own
ON core.locatarios
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (
  api.ctx_scope() = 'TENANT'
  AND locatario_id = api.ctx_tenant_id()
)
WITH CHECK (
  api.ctx_scope() = 'TENANT'
  AND locatario_id = api.ctx_tenant_id()
);

-- ============================================================
-- 4) Tabelas tenant-scoped em core
-- ============================================================

ALTER TABLE core.configuracoes_locatario ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_configuracoes_locatario_tenant
ON core.configuracoes_locatario
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_usuarios_tenant
ON core.usuarios
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.tokens_locatario ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_tokens_locatario_tenant
ON core.tokens_locatario
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.usuarios_papeis ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_usuarios_papeis_tenant
ON core.usuarios_papeis
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.modulos_locatario ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_modulos_locatario_tenant
ON core.modulos_locatario
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.assinaturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_assinaturas_tenant
ON core.assinaturas
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_clientes_tenant
ON core.clientes
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_fornecedores_tenant
ON core.fornecedores
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.estoques ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_estoques_tenant
ON core.estoques
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_produtos_tenant
ON core.produtos
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.ordens_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_ordens_servico_tenant
ON core.ordens_servico
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.transacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_transacoes_tenant
ON core.transacoes
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.itens_transacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_itens_transacao_tenant
ON core.itens_transacao
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE core.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_movimentacoes_estoque_tenant
ON core.movimentacoes_estoque
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

-- ============================================================
-- 5) Tabelas tenant-scoped em jobs
-- ============================================================

ALTER TABLE jobs.importacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_importacoes_tenant
ON jobs.importacoes
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE jobs.itens_importacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_itens_importacao_tenant
ON jobs.itens_importacao
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

ALTER TABLE jobs.exportacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_exportacoes_tenant
ON jobs.exportacoes
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));

-- ============================================================
-- 6) Auditoria de locatário
-- ============================================================

ALTER TABLE audit.auditoria_locatario ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_auditoria_locatario_tenant
ON audit.auditoria_locatario
TO multilocatario_aplicacao, multilocatario_leitor, multilocatario_auditor, multilocatario_operador_job
USING (api.rls_tenant_read(locatario_id))
WITH CHECK (api.rls_tenant_write(locatario_id));
