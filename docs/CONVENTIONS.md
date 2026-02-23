# CONVENTIONS.md

## Objetivo

Este documento define convenções para manter consistência, facilitar manutenção e melhorar a geração/assistência por ferramentas (incluindo Copilot).

## Linguagem e nomenclatura

- Preferir termos em português quando possível (ex.: `locatario`, `permissao`, `papel`).
- IDs tipados:
  - `type LocatarioId = string`
  - `type UsuarioId = string`
- Funções e arquivos por intenção:
  - `criarCliente.ts`, `buscarClientePorId.ts`
- Evite nomes genéricos: `handle`, `process`, `data`, `manager`.

## Organização por camadas

Regras:
- `domain/` não importa nada de `infra/` ou framework.
- `usecases/` depende de `domain/` e `ports/`.
- `infra/` implementa interfaces definidas em `ports/`.
- `web/` (Fastify) é só adapter (parse, validate, map result -> HTTP).

## Estilo de casos de uso (Usecases)

Padrão recomendado:
- um arquivo por caso de uso
- função principal recebe `ctx` e `input` (DTO)
- depende de um `deps` (injeção explícita) para ports

Exemplo de assinatura:
- `executar(ctx: ContextoExecucao, input: InputDTO, deps: Deps): Promise<Result<OutputDTO, AppError>>`

Dentro do usecase:
1. validar entrada (camada application; domínio valida invariantes)
2. checar permissão (se necessário)
3. carregar dependências (repos)
4. aplicar regra de negócio
5. persistir
6. retornar Result tipado

## Validação

- Validação de formato (strings vazias, limites) pode ficar no usecase.
- Invariantes de entidade (ex.: dinheiro não negativo) devem viver no domínio.
- Não confiar em validação do controller (mas pode existir como “primeiro filtro”).

## Erros

Definir `AppError` com:
- `code` estável (ex.: `CLIENTE_NAO_ENCONTRADO`)
- `message` humana
- `details` opcional

Regras:
- Usecases retornam `Err(AppError)` para falhas esperadas.
- Exceptions são para falhas inesperadas (bug, misconfig, etc.).
- Não retornar strings soltas como erro.

## Result pattern

Convenção:
- `Ok(value)`
- `Err(error)`

Evitar:
- `null` como erro silencioso
- booleano sem contexto (`false` sem motivo)

## Multi-tenant

Regras obrigatórias:
- Todo acesso a dado persistido deve ser filtrado por `locatarioId`.
- Nunca aceitar `locatarioId` vindo do body do cliente como “autoridade”.
- `locatarioId` vem do `ContextoExecucao` (token / subdomínio / header confiável).

Sugestões:
- incluir `locatarioId` em todas as queries
- chaves compostas quando necessário
- logs/auditoria sempre com `locatarioId`

## Autorização (Papéis/Permissões)

- Permissões como strings estáveis e documentadas.
- Papéis mapeiam para permissões (ou grupos).
- Sempre checar permissão em um ponto claro do usecase.

Convenção:
- `assertPermissao(ctx, "clientes.ler")` lança/retorna `Err(SEM_PERMISSAO)`.

## Commits e PRs (opcional)

- Mensagens claras: `core: adicionar usecase criarCliente`
- PR com:
  - descrição do problema
  - abordagem
  - como testar
  - screenshots quando UI

## Testes (Vitest)

- Testes unitários próximos do módulo (ex.: `__tests__/`)
- Use fakes:
  - `FakeClienteRepo`
  - `FakeClock`
- TDD:
  1. escrever teste
  2. implementar mínimo
  3. refatorar

Nome de testes:
- `deve_criar_cliente_valido`
- `deve_rejeitar_email_invalido`

## Comentários “amigos do Copilot”

Comentários úteis são do tipo especificação local, por exemplo no topo de um usecase:

- Regras:
  - ...
- Edge cases:
  - ...
- Notas de segurança:
  - ...

Evitar:
- comentários óbvios (“incrementa i”)
- comentários que descrevem linha a linha

## Templates rápidos (para copiar)

### Usecase (topo)
- Objetivo:
- Entradas:
- Saídas:
- Regras:
- Erros:
- Permissões necessárias:

### Porta (interface)
- Descrição
- Contrato de retorno (null? erro?)
- Regras de multi-tenant