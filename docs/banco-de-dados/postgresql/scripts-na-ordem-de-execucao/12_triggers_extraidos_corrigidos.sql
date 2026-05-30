-- ============================================================
-- 12_triggers_extraidos_corrigidos.sql
-- Triggers extraídas dos arquivos enviados
--
-- Pré-requisito:
-- - 11_funcoes_extraidas_corrigidas.sql já executado
--
-- Observação:
-- - Apenas triggers óbvias de normalização/timestamp/proteção foram geradas.
-- - Triggers de auditoria automática não foram geradas nesta etapa.
-- ============================================================

SET search_path TO core, audit, jobs, api, public;

-- ============================================================
-- 1) Normalização de email em usuários
-- ============================================================

CREATE TRIGGER trg_usuarios_normalizar_email
BEFORE INSERT OR UPDATE OF email ON core.usuarios
FOR EACH ROW
EXECUTE FUNCTION api.fn_normalizar_email_usuario();

CREATE TRIGGER trg_usuarios_plataforma_normalizar_email
BEFORE INSERT OR UPDATE OF email ON core.usuarios_plataforma
FOR EACH ROW
EXECUTE FUNCTION api.fn_normalizar_email_usuario();

-- ============================================================
-- 2) Normalização de nome
-- ============================================================

CREATE TRIGGER trg_locatarios_normalizar_nome
BEFORE INSERT OR UPDATE OF nome ON core.locatarios
FOR EACH ROW
EXECUTE FUNCTION api.fn_normalizar_nome();

CREATE TRIGGER trg_usuarios_normalizar_nome
BEFORE INSERT OR UPDATE OF nome ON core.usuarios
FOR EACH ROW
EXECUTE FUNCTION api.fn_normalizar_nome();

CREATE TRIGGER trg_usuarios_plataforma_normalizar_nome
BEFORE INSERT OR UPDATE OF nome ON core.usuarios_plataforma
FOR EACH ROW
EXECUTE FUNCTION api.fn_normalizar_nome();

CREATE TRIGGER trg_clientes_normalizar_nome
BEFORE INSERT OR UPDATE OF nome ON core.clientes
FOR EACH ROW
EXECUTE FUNCTION api.fn_normalizar_nome();

CREATE TRIGGER trg_fornecedores_normalizar_nome
BEFORE INSERT OR UPDATE OF nome ON core.fornecedores
FOR EACH ROW
EXECUTE FUNCTION api.fn_normalizar_nome();

CREATE TRIGGER trg_produtos_normalizar_nome
BEFORE INSERT OR UPDATE OF nome ON core.produtos
FOR EACH ROW
EXECUTE FUNCTION api.fn_normalizar_nome();

CREATE TRIGGER trg_estoques_normalizar_nome
BEFORE INSERT OR UPDATE OF nome ON core.estoques
FOR EACH ROW
EXECUTE FUNCTION api.fn_normalizar_nome();

-- ============================================================
-- 3) atualizado_em / criado_em
-- ============================================================

CREATE TRIGGER trg_locatarios_timestamps
BEFORE INSERT OR UPDATE ON core.locatarios
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_configuracoes_locatario_timestamps
BEFORE INSERT OR UPDATE ON core.configuracoes_locatario
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_usuarios_timestamps
BEFORE INSERT OR UPDATE ON core.usuarios
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_usuarios_plataforma_timestamps
BEFORE INSERT OR UPDATE ON core.usuarios_plataforma
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_clientes_timestamps
BEFORE INSERT OR UPDATE ON core.clientes
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_fornecedores_timestamps
BEFORE INSERT OR UPDATE ON core.fornecedores
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_estoques_timestamps
BEFORE INSERT OR UPDATE ON core.estoques
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_produtos_timestamps
BEFORE INSERT OR UPDATE ON core.produtos
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_ordens_servico_timestamps
BEFORE INSERT OR UPDATE ON core.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_transacoes_timestamps
BEFORE INSERT OR UPDATE ON core.transacoes
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_itens_transacao_timestamps
BEFORE INSERT OR UPDATE ON core.itens_transacao
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_importacoes_timestamps
BEFORE INSERT OR UPDATE ON jobs.importacoes
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

CREATE TRIGGER trg_exportacoes_timestamps
BEFORE INSERT OR UPDATE ON jobs.exportacoes
FOR EACH ROW
EXECUTE FUNCTION api.fn_definir_criado_e_atualizado_em();

-- ============================================================
-- 4) Proteção de exclusão física de locatário com usuários ativos
-- ============================================================

CREATE TRIGGER trg_locatarios_impedir_delete_com_usuarios
BEFORE DELETE ON core.locatarios
FOR EACH ROW
EXECUTE FUNCTION api.fn_impedir_exclusao_locatario_com_usuarios();
