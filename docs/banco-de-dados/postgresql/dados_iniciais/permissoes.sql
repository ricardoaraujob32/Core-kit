INSERT INTO permissoes (codigo, nome) VALUES
  ('LOCATARIO_LER','Ler locatários'),
  ('LOCATARIO_GERIR','Gerir locatários'),
  ('USUARIO_GERIR','Gerir usuários'),
  ('AUDITORIA_LER','Visualizar auditoria'),
  ('IMPORTACAO_EXECUTAR','Executar importações'),
  ('EXPORTACAO_EXECUTAR','Executar exportações')
ON CONFLICT (codigo) DO NOTHING;
