-- Adiciona vínculo formal entre ordem de serviço e serviço do catálogo.
-- Serviço é um registro da tabela produtos com tipo = 'SERVICO'.

ALTER TABLE core.ordens_servico
  ADD COLUMN IF NOT EXISTS servico_id uuid NULL;

CREATE INDEX IF NOT EXISTS idx_ordens_servico_servico
  ON core.ordens_servico (locatario_id, servico_id);

-- Ajuste o nome/constraint conforme o padrão real do seu banco.
-- Se produtos tiver PK composta por locatario_id + produto_id, prefira a FK composta abaixo.
ALTER TABLE core.ordens_servico
  DROP CONSTRAINT IF EXISTS ordens_servico_servico_fk;

ALTER TABLE core.ordens_servico
  ADD CONSTRAINT ordens_servico_servico_fk
  FOREIGN KEY (locatario_id, servico_id)
  REFERENCES core.produtos (locatario_id, produto_id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;

-- Validação opcional: impede vincular produto que não seja serviço.
-- Use como trigger se quiser enforcement no banco; FK não valida tipo.
-- A validação de tipo também deve ficar na aplicação quando for necessário.
