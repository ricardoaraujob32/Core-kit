CREATE INDEX IF NOT EXISTS idx_auditoria_locatario_criacao ON auditoria(locatario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_executor_criacao ON auditoria(usuario_executor_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_acao ON auditoria(acao);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria(tipo_entidade, entidade_id);
