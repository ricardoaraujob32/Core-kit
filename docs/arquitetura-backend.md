# Decisões consolidadas – Mini SaaS Multi-Locatário (até aqui)

Este documento registra as decisões confirmadas no chat e nos arquivos-fonte atuais.

## 1) Fonte da verdade (a partir de agora)

- Banco de dados:
  - `esquema_bd_v12.md`
  - `esquema_bd_v12.mmd`
  Esses 2 arquivos são a **fonte da verdade** do modelo de dados.

- Padrão ROP (Railway Oriented Programming):
  - `result.ts`
  - `erros.ts`
  - `ROPHelpers.ts`
  Esses 3 arquivos são a implementação oficial do padrão **Result/ErroApp**.

- RBAC (contrato de papéis/permissões):
  - `permissoes.ts` define o catálogo canônico de permissões (strings oficiais).
  - `papeis.ts` define papéis canônicos/sugeridos, sendo papéis agrupadores de permissões.

## 2) Contexto geral do projeto

- Projeto: mini SaaS multi-locatário.
- Estado: BD avançado + backend em progresso + testes unitários; frontend ainda não iniciado.
- Objetivo: esclarecer escopo/estado, manter padrões e evoluir o backend com segurança.

## 3) Ferramentas e stack (decisão)

- SO: Linux Mint
- IDE: VS Code
- SGBD: PostgreSQL + DBeaver
- Backend: Node.js + TypeScript (e Python quando aplicável)
- Frontend (futuro): React
- Frameworks: Prisma + Fastify
- Testes: Vitest
- Versionamento/gestão: GitHub + GitHub Actions + GitHub Projects
- IA: ChatGPT + GitHub Copilot
- Navegador: Firefox

## 4) Metodologia e arquitetura (decisão)

- Clean Architecture / SPA (para o produto completo).
- TDD quando viável: **testes antes** dos arquivos/funcionalidades novas.
- Modelagem parte do banco (e o BD é governado pela fonte da verdade do esquema).
- Scrumban.
- “Super paradigma”: ROP + funcional + POO + eventos + aspectos.
- Segurança como princípio: RBAC + Zero Trust.

## 5) Contexto de execução (decisão)

- `contextoExecucao.ts` já existe e é considerado parte do núcleo.
- O ContextoExecucao:
  - é criado apenas pelo factory (`createContextoExecucao`)
  - aplica branding e `Object.freeze` (imutabilidade)
  - faz cópias defensivas de `papeis` e `permissoes`
- A validação de autenticação deve usar `exigirUsuario(ctx)` e tratar `ErroApp` com código `NAO_AUTENTICADO`.

## 6) RBAC (decisão)

- RBAC é baseado em **permissões**.
- **Papéis** são apenas agrupamentos (conveniência/UX), não a regra final.
- Permissões e papéis devem seguir os contratos em `permissoes.ts` e `papeis.ts`.

## 7) Tokens e autenticação (decisão)

- JWT será usado para token de **ACESSO** (stateless).
- Tipos de token (enum): `ACESSO`, `REFRESH`, `RECUPERACAO_SENHA`, `CONFIRMACAO_EMAIL`.
- TTLs:
  - ACESSO: 10 minutos
  - REFRESH: 14 dias
  - RECUPERACAO_SENHA: 60 minutos
  - CONFIRMACAO_EMAIL: 72 horas
- Modelo de persistência escolhido:
  - ACESSO: JWT stateless
  - REFRESH e tokens one-time: persistidos (hash-only) conforme tabela `tokens` no esquema BD
  - Refresh deve suportar rotação encadeada conforme `proximo_token_id/proximo_usuario_id`

## 8) Restrições e disciplina de evolução

- Não redefinir arquitetura sem solicitação explícita.
- Respeitar limites e padrões definidos na documentação e escolhas de ferramentas.
- Antes de entregar novos arquivos de implementação, criar testes unitários correspondentes.

# Documento Oficial Backend

## RBAC

- Estrutura: tipos, portasRepositorio, repositorioMemoria, usecases.
- Baseado exclusivamente em permissões.
- Cache por ContextoExecucao (WeakMap).
- Padrão ROP obrigatório.

## Tokens

- Access: JWT stateless (10 min).
- Refresh: persistido (14 dias).
- Rotação encadeada obrigatória.
- Replay => NAO_AUTENTICADO.


# Decisões consolidadas – Mini SaaS Multi-Locatário (até aqui)

## 1) Fonte da verdade

- Banco de dados (source of truth):
  - `esquema_bd_v12.md`
  - `esquema_bd_v12.mmd`

- Padrão ROP (implementação oficial):
  - `result.ts`
  - `erros.ts`
  - `ROPHelpers.ts`

- RBAC (contrato canônico):
  - `permissoes.ts` (catálogo oficial; sem strings mágicas fora dele)
  - `papeis.ts` (papéis sugeridos; papéis são agrupadores/UX)

- Contexto de execução (núcleo já existente):
  - `contextoExecucao.ts`

## 2) Regras de desenvolvimento

- TDD como disciplina: **criar testes unitários antes de entregar implementação**.
- Backend deve consumir o schema existente como especificação (sem “arquitetura de BD” em resposta).

## 3) Segurança e autorização

- RBAC baseado em permissões.
- Papéis são apenas agrupamentos de permissões (organização/UX).
- Decisão de autorização é sempre no backend.

## 4) Tokens e autenticação

- Token de acesso: **JWT stateless**.
- Tipos de token: `ACESSO`, `REFRESH`, `RECUPERACAO_SENHA`, `CONFIRMACAO_EMAIL`.
- TTLs:
  - ACESSO: 10 minutos
  - REFRESH: 14 dias
  - RECUPERACAO_SENHA: 60 minutos
  - CONFIRMACAO_EMAIL: 72 horas
- Persistência escolhida:
  - ACESSO: não persiste (JWT)
  - REFRESH e tokens one-time: persistem como hash-only conforme `tokens` do schema
  - refresh com rotação encadeada (token antigo aponta para o próximo)
  - tokens de senha/email são one-time (revogar ao consumir)

## 5) Stack e padrões gerais (contexto do projeto)

- Linux Mint + VS Code + PostgreSQL/DBeaver
- Node.js + TypeScript, Prisma + Fastify
- Testes: Vitest
- Gestão/CI: GitHub + Actions + Projects