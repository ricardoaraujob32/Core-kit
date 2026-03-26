# Módulo Tokens

## Objetivo

Responsável pela persistência, consulta e ciclo de vida de tokens no escopo de locatários e usuários.

## Natureza

Este é um pacote base especializado.

## Dependências permitidas

- kernel
- transversal
- locatarios
- usuarios

## Dependências proibidas

- rbac
- auth
- outros pacotes de domínio não necessários

## Escopo atual

- emitir token persistido
- obter token por hash
- listar tokens do usuário
- revogar token
- rotacionar token

## Regra de escopo

Todo token existe no escopo conjunto de:

- `locatarioId`
- `usuarioId`

Por isso, operações de leitura operacional por `tokenId` e `hashToken` exigem esse escopo explicitamente.

## Contrato dos casos de uso

Cada caso de uso do módulo segue o padrão:

- `XInput`
- `XOutput`
- `XResult`

Exemplos:

- `EmitirTokenInput`, `EmitirTokenOutput`, `EmitirTokenResult`
- `RevogarTokenInput`, `RevogarTokenOutput`, `RevogarTokenResult`
- `RotacionarTokenInput`, `RotacionarTokenOutput`, `RotacionarTokenResult`

## Máquina de estados lógica

O token não precisa persistir um campo `status`, pois seu estado é derivado a partir de:

- `revogadoEm`
- `expiraEm`
- instante atual

Estados lógicos:

- `ATIVO`
- `REVOGADO`
- `EXPIRADO`

Eventos formais:

- `REVOGAR`
- `ROTACIONAR`

Regras:

- token revogado não é operacionalmente válido
- token expirado não é operacionalmente válido
- token ativo pode ser revogado
- token ativo pode ser rotacionado
- token revogado não pode ser reutilizado
- token expirado não pode ser reutilizado

## Transações

As mutações seguem o padrão transacional do Core:

- validação antes do bloco transacional
- `executarEmTransacao(...)` como envelope canônico
- rotação como operação atômica

A rotação:

1. valida token atual
2. revoga token anterior
3. cria token novo
4. aponta o token anterior para o novo

## Regras

- hash de token deve ser único no escopo operacional adotado pelo repositório
- token revogado não é operacionalmente válido
- token expirado não é operacionalmente válido
- rotação revoga o token anterior e cria um novo
- o token anterior aponta para o próximo token

## Limites do módulo

Este pacote não trata:

- autenticação completa
- senha
- login
- RBAC
- emissão JWT como fluxo de autenticação completa

Essas responsabilidades pertencem ao módulo `auth`, que orquestra `tokens` sem absorver sua lógica interna.