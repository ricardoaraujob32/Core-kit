\copy (
  SELECT *
  FROM tabela
  WHERE locatario_id = '...'
) TO '/caminho/saida.csv'
CSV HEADER
ENCODING 'UTF8';
