ALTER TABLE papel_permissoes
ADD CONSTRAINT pk_papel_permissoes
PRIMARY KEY (papel_id, permissao_id);

ALTER TABLE papel_permissoes
ADD CONSTRAINT fk_papel_permissoes_papeis
FOREIGN KEY (papel_id)
REFERENCES papeis(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE papel_permissoes
ADD CONSTRAINT fk_papel_permissoes_permissoes
FOREIGN KEY (permissao_id)
REFERENCES permissoes(id)
ON UPDATE CASCADE
ON DELETE CASCADE;