# 🧩 AI PROMPTS (Copilot Chat / ChatGPT)
Versão 1.0

Requisito: use sempre com arquivos âncora abertos ao lado do arquivo alvo
(ARCHITECTURE, CONVENTIONS, ERRORS, PERMISSIONS, TENANCY, TOKENS, AUTH_FLOW).

---

## Usecase novo
"Create a new usecase following AI_IDE_RULES_USECASE.md. Inputs: ..., Outputs: ..., Required permission: ..., Errors: ..."

## Gerar testes TDD (Vitest)
"Write Vitest tests first for this usecase: success + validation failure + SEM_PERMISSAO + tenant isolation."

## Refatorar mantendo padrão
"Refactor this file to match our conventions: Result pattern, AppErrorCode, tenant scope, no business logic in handlers."

## Criar Port + InMemory fake
"Create a Port interface and an InMemory implementation that respects tenant isolation and matches our repo contract."

## Mapear Result -> HTTP
"Add consistent HTTP mapping for AppErrorCode based on ERRORS.md and existing handler template."

---

## Prompt longo (para início de chat difícil)
Context:
- Clean Architecture + ports/usecases
- Multi-tenant required: ctx.locatarioId is authority
- Errors are AppError with AppErrorCode union type
- Permissions are strings from catalog
- Testing standard: Vitest; TDD preferred
Task:
- Implement feature X following above rules
Output:
- Provide code + tests; no new patterns without updating docs/templates
