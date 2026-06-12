# TOKENS.md

## Objetivo

Definir padrões de autenticação baseados em tokens, garantindo:

- segurança
- isolamento multi-tenant
- previsibilidade de contexto
- compatibilidade com autorização por permissões

---

## Princípios

- Token prova identidade (autenticação)
- Permissões definem capacidades (autorização)
- Token NÃO substitui validação de regras de negócio

---

## Claims mínimas recomendadas

Todo token válido deve conter:

- `locatarioId`
- `usuarioId` (quando autenticado)
- `exp` (expiração)
- `iat` (emitido em)

Opcionalmente:

- `papeis`
- `permissoes`
- `tokenVersion`

---

## Exemplo conceitual de payload

```json
{
  "locatarioId": "loc_123",
  "usuarioId": "usr_456",
  "papeis": ["gerente"],
  "permissoes": ["clientes.ler", "clientes.criar"],
  "exp": 1700000000
}