ALTER TABLE auditoria
ADD CONSTRAINT pk_auditoria
PRIMARY KEY (id, locatario_id);

ALTER TABLE auditoria
ADD CONSTRAINT fk_auditoria_locatarios
FOREIGN KEY (locatario_id)
REFERENCES locatarios(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE auditoria
ADD CONSTRAINT fk_auditoria_usuarios
FOREIGN KEY (usuario_executor_id)
REFERENCES usuarios(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_auditoria_locatario_criacao ON auditoria(locatario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_executor_criacao ON auditoria(usuario_executor_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_acao ON auditoria(acao);

CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria(tipo_entidade, entidade_id);
