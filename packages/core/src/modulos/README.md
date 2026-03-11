# modulosHabilitados

Módulo do core responsável por resolver os módulos habilitados de um locatário.

## Responsabilidades

- listar módulos habilitados do locatário
- verificar se um módulo específico está habilitado
- exigir módulo habilitado antes da execução de um usecase

## Regras

- o core não autoriza por plano diretamente
- a autorização funcional usa módulos resolvidos por locatário
- a fonte preferencial no banco é a view `vw_modulos_habilitados_locatario`
- a regra final do backend tende a ser:

`tenant válido && módulo habilitado && permissão autorizada`

## Operações

- `listarModulosHabilitados`
- `moduloEstaHabilitado`
- `exigirModuloHabilitado`

## Integração esperada com BD

A camada infra deve consultar a view resolvida por locatário, unindo:

- módulos gratuitos do núcleo
- módulos efetivamente habilitados em `modulos_locatario`

## Erros importantes

- `INVALIDO` para entradas obrigatórias inválidas
- `NAO_AUTORIZADO` quando o módulo não estiver habilitado
- `ERRO_INTERNO` quando houver falha de infraestrutura