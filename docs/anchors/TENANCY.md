# TENANCY.md

## Objetivo

Definir as estratégias de **multi-tenant (multi-locatário)** adotadas pelo sistema, garantindo:

- isolamento de dados
- previsibilidade arquitetural
- escalabilidade
- segurança
- consistência entre módulos

Princípio central:

👉 Todo dado pertence a um **locatário (tenant / locatário / organização)**.

---

## Conceitos fundamentais

### Locatário (Tenant)

Representa a entidade lógica de isolamento:

Exemplos:

- empresa
- clínica
- loja
- organização
- workspace

Regras:

✔ Cada locatário é isolado  
✔ Operações sempre ocorrem dentro de um locatário  
✔ ContextoExecucao é a autoridade de escopo  

---

## Estratégias de multi-tenant

Existem três modelos principais.

---

### 1️⃣ Isolamento por Schema (Schema-per-Tenant)

Cada locatário possui seu próprio schema no banco.

Exemplo:

- `tenant_a.clientes`
- `tenant_b.clientes`

✔ Forte isolamento  
✔ Fácil backup por locatário  
✔ Bom para SaaS B2B  

❌ Mais complexo para migrações  
❌ Maior overhead operacional  

Indicado quando:

- poucos locatários grandes
- exigências fortes de isolamento

---

### 2️⃣ Isolamento por Coluna (Row-Level / Shared Schema)

Todos compartilham as mesmas tabelas.

Exemplo:

```sql
clientes (
  id,
  locatario_id,
  nome
)