# Módulo Backups

## Objetivo

Responsável pela semântica de backup e restauração do locatário.

## Natureza do pacote

Este pacote não é base.
Ele é um pacote orquestrador de nível acima.

## Dependências

Depende de:

- exportacoes
- importacoes
- kernel/transversal

Não possui persistência própria.

## Responsabilidades

- solicitar backup do locatário
- listar backups do locatário
- solicitar restauração do locatário

## Convenções

### backup
É uma exportação com:

- `parametros.tipo = "BACKUP_LOCATARIO"`

### restauração
É uma importação com:

- `mapeamentoColunas.tipo = "RESTAURACAO_LOCATARIO"`

## Regras

- um backup em aberto por locatário
- uma restauração em aberto por locatário
- restauração só a partir de backup do mesmo locatário
- restauração só a partir de backup concluído