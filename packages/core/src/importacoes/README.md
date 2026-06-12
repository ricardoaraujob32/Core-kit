# Módulo Importações

## Objetivo

Responsável pelos jobs de importação do locatário e pelos itens processados de cada importação.

## Escopo

- solicitar importação
- registrar item de importação
- listar importações do locatário
- listar itens de uma importação
- marcar importação em execução
- marcar importação concluída
- marcar importação com falha
- marcar item como processado
- marcar item com falha

## Regras

- toda importação pertence a um locatário
- cada item de importação pertence à importação e ao locatário
- o job nasce em `PENDENTE`
- itens nascem em `PENDENTE`
- importação e itens possuem fluxo de status controlado

## Observações

`itens_importacao` não é pacote próprio.
Ele pertence ao contexto de `importacoes`.