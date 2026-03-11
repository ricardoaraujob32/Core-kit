CREATE OR REPLACE VIEW vw_modulos_habilitados_locatario AS
SELECT
  l.locatario_id,
  m.codigo,
  'SISTEMA'::TEXT AS origem
FROM locatarios l
JOIN modulos m
  ON m.gratuito = TRUE
 AND m.ativo = TRUE

UNION

SELECT
  ml.locatario_id,
  m.codigo,
  ml.origem
FROM modulos_locatario ml
JOIN modulos m
  ON m.id = ml.modulo_id
WHERE ml.habilitado = TRUE
  AND m.ativo = TRUE;