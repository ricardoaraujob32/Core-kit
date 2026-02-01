\copy tabela_destino(coluna1, coluna2, coluna3)
FROM '/caminho/arquivo.csv'
DELIMITER ';'
CSV HEADER
ENCODING 'UTF8';
