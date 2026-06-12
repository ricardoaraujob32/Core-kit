-- ============================================================
-- 00_drop_tabelas.sql
-- Reinício da estrutura de tabelas
--
-- Objetivo:
-- - remover todas as tabelas dos schemas core, audit e jobs
-- - preservar schemas, roles, grants e enums já criados/corrigidos
--
-- ATENÇÃO:
-- - usar apenas em ambiente de desenvolvimento/teste
-- - apaga dados
-- - CASCADE remove FKs/dependências entre tabelas
-- ============================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      schemaname,
      tablename
    FROM pg_tables
    WHERE schemaname IN ('audit', 'jobs', 'core')
    ORDER BY
      CASE schemaname
        WHEN 'audit' THEN 1
        WHEN 'jobs' THEN 2
        WHEN 'core' THEN 3
        ELSE 99
      END,
      tablename
  LOOP
    EXECUTE format(
      'DROP TABLE IF EXISTS %I.%I CASCADE',
      r.schemaname,
      r.tablename
    );
  END LOOP;
END;
$$;

-- Confirmação: deve retornar zero linhas
SELECT
  schemaname AS schema,
  tablename AS tabela
FROM pg_tables
WHERE schemaname IN ('core', 'audit', 'jobs')
ORDER BY schemaname, tablename;
