ALTER TABLE configuracoes_locatario
ADD CONSTRAINT pk_configuracoes_locatario
PRIMARY KEY (locatario_id, configuracao_id);

ALTER TABLE configuracoes_locatario
ADD CONSTRAINT fk_configuracoes_locatario_locatarios
FOREIGN KEY (locatario_id)
REFERENCES locatarios (id)
ON UPDATE CASCADE
ON DELETE CASCADE;