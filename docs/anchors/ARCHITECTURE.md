# ARCHITECTURE.md

## Visão geral

Este repositório (Core Kit) organiza código em módulos e camadas para maximizar:
- clareza de regras de negócio
- testabilidade (TDD)
- consistência de erros/retornos
- suporte a multi-tenant (locatário no centro do contexto)
- autorização (papéis/permissões) como preocupação transversal

Princípios:
- **Domínio e casos de uso** não dependem de frameworks.
- **Infra/Adapters** implementam contratos (interfaces) definidos pelas camadas internas.
- Tudo é guiado por **Contexto de Execução** (locatário, usuário, papéis, permissões, clock, etc.).

## Estrutura (alto nível)

Sugestão de estrutura por pacote (ex.: `packages/core/src`):

- `domain/`
  - entidades, value objects, regras/invariantes
  - tipos de domínio (IDs, enums, etc.)
- `usecases/`
  - casos de uso (application services)
  - orquestração de regras e dependências
- `ports/`
  - interfaces/contratos para repositórios, serviços externos, clock, id generator
- `infra/`
  - implementações concretas (DB, HTTP clients, crypto, jwt, etc.)
- `web/` (ou `adapters/http/`)
  - controllers/handlers (Fastify, etc.)
- `auth/`
  - autorização: papéis, permissões, verificação, políticas
- `errors/`
  - catálogo de erros e helpers (AppError, códigos, etc.)
- `context/`
  - ContextoExecucao e buildContextFromRequest (locatário, usuário, claims, etc.)
- `tests/`
  - helpers, fakes, fixtures

> Ajuste para a sua estrutura atual (ex.: `infra/`, `tokens/`, `clientes/`, `ordensServico/` etc.). O importante é manter o “centro” independente.

## Fluxo de requisição (referência)

1. HTTP request entra no adapter (`web/` ou handler Fastify).
2. Adapter extrai autenticação/tenant e cria um `ContextoExecucao`.
3. Adapter chama um `usecase` (função pura o quanto possível).
4. Usecase usa `ports` (interfaces) para acessar DB/serviços.
5. Usecase retorna `Result<T, AppError>` (ou padrão adotado).
6. Adapter traduz o resultado em resposta HTTP.

## Contexto de Execução (Core)

O Contexto deve conter, no mínimo:
- `locatarioId: LocatarioId` (obrigatório)
- `usuarioId?: UsuarioId | null`
- `papeis?: Papel[]`
- `permissoes?: Permissao[]`
- `agora?: () => Date` (clock injetável, facilita teste)
- (opcional) `requestId`, `ip`, `userAgent`, etc.

Objetivo:
- garantir que **toda operação** tenha escopo de locatário
- habilitar autorização e auditoria
- facilitar rastreabilidade e testes determinísticos

## Autorização (papéis/permissões)

Modelo recomendado:
- permissões com sintaxe estável e granular (ex.: `clientes.ler`, `estoque.movimentar`, `financeiro.receber`)
- papéis como coleções de permissões (ex.: `admin`, `gerente`, `operador`, `leitura`)
- checagem sempre com contexto explícito:
  - `assertPermissao(ctx, "clientes.ler")`
  - ou `hasPermissao(ctx, ...)`

Diretriz:
- usecase decide *quando* verificar
- a regra de “quem pode o quê” deve estar documentada e testada

## Tokens e autenticação

Separar conceitos:
- autenticação: provar identidade (token, sessão, etc.)
- autorização: o que pode fazer (papéis/permissões)

Tokens devem carregar claims mínimos:
- `locatarioId`
- `usuarioId` (se houver)
- (opcional) `papeis`/`permissoes` ou um `tokenVersion`/`rolesVersion` para invalidar

## Erros e Result pattern

Padronizar:
- erros são **tipados** e possuem `code` (estável)
- usecases retornam `Result` em vez de “exceptions como fluxo normal”
- exceptions ficam para bugs/violação inesperada (ex.: null pointer)

## Testes

Padrão:
- **Vitest**
- TDD: teste primeiro para regras de negócio
- Use fakes/in-memory repos para `ports`
- Tenha testes por camada:
  - unitários de domínio e usecases (maior parte)
  - integração pontual (db/http) onde fizer sentido

## Qualidade e consistência (pontos que ajudam o Copilot)

- nomes semânticos e consistentes (`LocatarioId`, `UsuarioRepo`, `EmitirTokenUsecase`)
- interfaces explícitas em `ports/`
- DTOs bem definidos para entradas/saídas de casos de uso
- comentários de intenção nos usecases (regras/edge cases)
- ADRs para decisões importantes