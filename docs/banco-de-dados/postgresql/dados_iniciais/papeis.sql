INSERT INTO papeis (codigo, nome) VALUES
  ('SUPERADMIN','Super Administrador'),
  ('ADMIN_LOCATARIO','Administrador do Locatário'),
  ('OPERADOR','Operador')
ON CONFLICT (codigo) DO NOTHING;
