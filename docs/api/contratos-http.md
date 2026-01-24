# Contratos HTTP (Core Kit API)

Este documento define o padrão de respostas HTTP do backend `apps/api`, baseado em:

- Result (ok/err) do pacote `@core-kit/core`
- RBAC (`exigirPermissao`, `exigirTodas`, `exigirAlguma`)
- Wrapper HTTP (`wrapRoute`) para normalizar respostas e erros
- Erros padronizados (`AppError` -> HTTP)

## 1. Headers de contexto (execução)

Os endpoints podem depender de contexto para autorização e multi-tenancy.

### 1.1. Headers recomendados (DEV / integração interna)

- `x-locatario-id`: identifica o locatário (tenant)
- `x-usuario-id`: identifica o usuário
- `x-permissoes`: lista de permissões (string separada por vírgula), ex: `usuarios:listar,usuarios:criar`

> Observação: em produção, isso costuma vir de um token (JWT) + middleware. No Core Kit, mantemos suporte a headers para facilitar testes e desenvolvimento.

## 2. Padrão de resposta de sucesso

### 2.1. 200 OK (com body)

Quando a rota retorna `ok({ ... })`, o wrapper responde com:

- Status: `200`
- Body: o valor retornado

Exemplo:

````json
{
  "ok": true,
  "data": ["alice", "bob"]
}


---

## 2) (Opcional mas recomendado) Atualizar `docs/processo.md` com “definição de pronto” de endpoint

Se você já tiver um doc de processo (parece que tem `docs/processo.md`), acrescente uma seção:

```md
## Definition of Done (Endpoint HTTP)
- rota implementada com `wrapRoute`
- status e payload conforme `docs/api/contratos-http.md`
- teste cobrindo pelo menos:
  - sucesso
  - erro esperado (ex.: forbidden/validation)
- lint/typecheck/test passam no CI
````
