-- =========================================================
-- RELAÇÃO PAPEL → PERMISSÕES (RBAC)
--
-- Define quais permissões pertencem a cada papel.
--
-- INVARIANTES:
-- - PK composta impede duplicidade
-- - Remover vínculo NÃO remove papel nem permissão
-- - Papéis herdam permissões exclusivamente daqui
-- =========================================================
CREATE TABLE IF NOT EXISTS papel_permissoes (
  papel_id      UUID NOT NULL,
  permissao_id  UUID NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_papel_permissoes') THEN
    ALTER TABLE papel_permissoes ADD CONSTRAINT pk_papel_permissoes PRIMARY KEY (papel_id, permissao_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_papel_permissoes_papeis') THEN
    ALTER TABLE papel_permissoes
    ADD CONSTRAINT fk_papel_permissoes_papeis
    FOREIGN KEY (papel_id)
    REFERENCES papeis(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_papel_permissoes_permissoes') THEN
    ALTER TABLE papel_permissoes
    ADD CONSTRAINT fk_papel_permissoes_permissoes
    FOREIGN KEY (permissao_id)
    REFERENCES permissoes(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;
END;
$$;

