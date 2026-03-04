
---

```md id="auth_flow_core_kit_01"
# AUTH_FLOW.md

## Objetivo

Documentar o fluxo completo de **autenticação + autorização + contexto de execução**.

Separação conceitual crítica:

- **Autenticação** → quem é o usuário
- **Autorização** → o que ele pode fazer

---

## Fluxo de alto nível

1. Usuário envia credenciais
2. Backend valida identidade
3. Backend emite token
4. Cliente usa token nas requisições
5. Backend valida token
6. Backend constrói ContextoExecucao
7. Usecase verifica permissões

---

## Etapa 1 — Autenticação

Entrada típica:

✔ login/senha  
✔ provider externo (OAuth etc.)  

Resultado:

✔ identidade validada  
✔ usuário conhecido  

Erros comuns:

- `CREDENCIAIS_INVALIDAS`
- `USUARIO_NAO_ENCONTRADO`

---

## Etapa 2 — Emissão de Token

Após autenticação bem-sucedida:

Token deve conter claims mínimas:

✔ `locatarioId`
✔ `usuarioId`
✔ `exp`

Opcional:

✔ papeis
✔ permissoes
✔ tokenVersion

---

## Etapa 3 — Uso do Token

Cliente envia token:

Exemplo HTTP:


---

## Etapa 4 — Validação do Token

Backend deve validar:

✔ assinatura
✔ expiração
✔ integridade

Erros típicos:

- `TOKEN_INVALIDO`
- `TOKEN_EXPIRADO`

---

## Etapa 5 — Construção do ContextoExecucao

Adapter (ex.: Fastify):

1. Extrai token
2. Valida token
3. Lê claims
4. Constrói ctx

ctx mínimo:

✔ locatarioId
✔ usuarioId
✔ permissoes (se houver)

---

## Etapa 6 — Autorização

Usecase verifica permissões.

Exemplo conceitual:

- `assertPermissao(ctx, "clientes.criar")`

Falha esperada:

- `SEM_PERMISSAO`

---

## Papéis vs Permissões

Papéis são conveniência.

Permissões são autoridade.

Preferir:

✔ verificação por permissões

---

## Estratégias comuns

### Token com permissões embutidas

✔ rápido  
✔ menos queries  

❌ exige rotação  

---

### Token mínimo + resolução backend

✔ flexível  
✔ permissões dinâmicas  

❌ mais queries  

---

## Expiração e refresh

Recomendação:

✔ tokens curtos  
✔ refresh separado  

---

## Revogação

Abordagens:

✔ blacklist  
✔ tokenVersion  
✔ rotação de chave  

---

## Regras de segurança críticas

🚨 Nunca confiar em permissões do frontend  
🚨 Token é fonte de identidade, não de verdade absoluta de domínio  
🚨 Usecases ainda validam regras de negócio  

---

## Fluxo mental correto

Token diz:

✔ quem é  
✔ em qual locatário  

Usecase decide:

✔ se pode executar  

---

## Benefícios arquiteturais

Fluxo bem definido evita:

✔ bugs de autorização  
✔ vazamento entre locatários  
✔ regras inconsistentes  

---

## Compatibilidade com Copilot / IA

Documentação + nomes consistentes ajudam IA a:

✔ sugerir checks corretos  
✔ evitar misturar autenticação/autorização  
✔ respeitar contexto  

Comentários úteis em adapters/usecases:

// Requires authenticated user
// Requires permission clientes.remover
// locatarioId must come from token