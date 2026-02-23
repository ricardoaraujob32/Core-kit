# PERMISSIONS.md

## Objetivo

Este documento define o modelo de autorização do sistema, baseado em:

- **Permissões** → ações atômicas e estáveis
- **Papéis (roles)** → agrupamentos de permissões
- **ContextoExecucao (ctx)** → fonte de verdade em tempo de execução

Princípios:

- Permissões são **strings estáveis e versionáveis**
- Papéis são **conveniência**, não regra rígida
- Usecases verificam permissões explicitamente
- Multi-tenant é obrigatório (sempre dentro de um locatário)

---

## Modelo conceitual

### Permissão

Permissão representa uma ação específica:

Exemplos:

- `clientes.ler`
- `clientes.criar`
- `clientes.atualizar`
- `clientes.remover`
- `estoque.movimentar`
- `financeiro.receber`

Regras:

- Sempre minúsculas
- Separação por domínio → `dominio.acao`
- Evitar nomes vagos (`manage`, `process`, etc.)

---

### Papel (Role)

Papel é um conjunto de permissões.

Papéis **não substituem permissões** — apenas agrupam.

Papéis sugeridos:

- `admin`
- `gerente`
- `operador`
- `leitura`

---

## Papéis padrão (baseline)

### admin

Acesso total dentro do locatário.

Características:

- Todas as permissões
- Não ignora escopo de locatário
- Ainda sujeito a regras de negócio

---

### gerente

Papel intermediário (muito útil em sistemas reais).

Características típicas:

- Pode criar/alterar dados
- Pode ver relatórios financeiros
- Pode gerenciar usuários (parcialmente)

Exemplo de permissões:

- `clientes.*`
- `fornecedores.*`
- `estoque.ler`
- `estoque.movimentar`
- `financeiro.ler`

---

### operador

Focado em operação diária.

Exemplo:

- `clientes.ler`
- `clientes.criar`
- `estoque.ler`
- `estoque.movimentar`

---

### leitura

Somente leitura / auditoria / consulta.

Exemplo:

- `clientes.ler`
- `estoque.ler`
- `financeiro.ler`

---

## Convenções de nomenclatura

Formato recomendado:

`<dominio>.<acao>`

Domínios típicos:

- clientes
- fornecedores
- estoque
- financeiro
- usuarios
- permissoes
- auditoria
- tokens

Ações típicas:

- ler
- criar
- atualizar
- remover
- movimentar
- aprovar
- cancelar

Evitar:

- verbos genéricos (`handle`, `process`)
- nomes ambíguos (`write`, `modify`)

---

## Wildcards (opcional)

Se usar curingas:

- `clientes.*` → todas do domínio
- Evitar wildcards globais (`*`)

---

## Verificação de permissões

Sempre via contexto:

Exemplo conceitual:

- `assertPermissao(ctx, "clientes.criar")`

Regras:

- Usecase decide QUANDO verificar
- Não confiar apenas no controller
- Falha de autorização = erro de domínio esperado

Erro típico:

- `SEM_PERMISSAO`

---

## Regras importantes de segurança

- Nunca confiar em permissões vindas do frontend
- Permissões vêm de fonte confiável (token / sessão)
- ctx é autoridade

---

## Boas práticas que ajudam o Copilot

✔ Permissões explícitas em constantes/types  
✔ Catálogo central de permissões  
✔ Papéis documentados  
✔ Usecases comentados com permissões necessárias  

Exemplo útil no topo de usecase:

Permissões necessárias:
- clientes.criar
- clientes.atualizar