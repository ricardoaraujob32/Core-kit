CREATE TABLE IF NOT EXISTS papel_permissoes (
  papel_id      UUID NOT NULL REFERENCES papeis(id) ON DELETE CASCADE,
  permissao_id  UUID NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
  PRIMARY KEY (papel_id, permissao_id)
);

