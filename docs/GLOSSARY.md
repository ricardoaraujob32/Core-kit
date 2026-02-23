# GLOSSARY.md

## Objetivo

Definir a **linguagem ubíqua (ubiquitous language)** do sistema.

Princípio central:

👉 Termos do domínio devem ter **significado único, estável e não ambíguo**.

Benefícios:

- reduz mal-entendidos
- evita bugs conceituais
- melhora legibilidade
- aumenta consistência arquitetural
- melhora drasticamente sugestões de IA/Copilot

---

## Regras de nomenclatura do projeto

- Um conceito → Um nome
- Evitar sinônimos conflitantes
- Preferir termos semanticamente precisos
- Código deve refletir estes termos

Exemplo correto:

✔ `locatarioId` em todo lugar  
❌ `tenantId`, `empresaId`, `orgId` misturados

---

## Termos fundamentais

### Locatário (Locatario / Tenant)

Entidade lógica que representa isolamento de dados.

Exemplos reais:

- empresa
- clínica
- loja
- organização

Regras:

✔ Todo dado pertence a um locatário  
✔ Toda operação ocorre dentro de um locatário  
✔ Identificado por `locatarioId`  

Nunca confundir com:

🚫 usuário  
🚫 cliente final  
🚫 conta de login  

---

### Usuário (Usuario)

Identidade autenticável que executa ações no sistema.

Características:

✔ Pode possuir papéis  
✔ Pode possuir permissões  
✔ Pode atuar em um ou mais locatários (dependendo do modelo)

Identificado por:

- `usuarioId`

---

### Papel (Role / Papel)

Agrupamento de permissões.

Exemplos:

- admin
- gerente
- operador
- leitura

Regras:

✔ Conveniência organizacional  
✔ Não substitui permissões  

---

### Permissão (Permissao)

Capacidade atômica de executar uma ação.

Formato:

`dominio.acao`

Exemplos:

- `clientes.ler`
- `clientes.criar`
- `estoque.movimentar`

Regras:

✔ Granular  
✔ Estável  
✔ Usada para autorização  

---

### Contexto de Execução (ContextoExecucao / ctx)

Objeto que representa identidade + escopo + capacidades no momento da execução.

Contém:

✔ locatarioId  
✔ usuarioId  
✔ permissoes  
✔ papeis (opcional)  

Função:

👉 Autoridade de segurança e escopo

---

### Caso de Uso (Usecase)

Unidade de comportamento do sistema.

Representa:

✔ ação de negócio  
✔ regra de aplicação  

Exemplos:

- criarCliente
- emitirToken
- cancelarPedido

Regras:

✔ Não depende de framework  
✔ Recebe ctx explicitamente  

---

### Domínio (Domain)

Camada que representa regras essenciais e invariantes.

Contém:

✔ entidades  
✔ value objects  
✔ regras puras  

Nunca conter:

🚫 HTTP  
🚫 Banco  
🚫 Framework  

---

### Repositório (Repository / Repo)

Abstração de persistência.

Responsável por:

✔ carregar  
✔ salvar  
✔ consultar  

Regras:

✔ Sempre respeitar locatário  
✔ Nunca acessar dados globais sem justificativa  

---

### Token

Artefato de autenticação que transporta identidade e claims.

Contém:

✔ usuarioId  
✔ locatarioId  
✔ expiração  

Não representa:

🚫 verdade absoluta de domínio  
🚫 autorização final  

---

### Claims

Informações embutidas no token.

Exemplos:

✔ locatarioId  
✔ usuarioId  
✔ permissoes (se adotado)  

---

### AppError

Erro esperado e modelado do sistema.

Contém:

✔ code estável  
✔ message humana  

Usado em:

✔ Result pattern  
✔ Fluxos normais de falha  

---

### Result

Representa sucesso ou falha controlada.

Tipos:

✔ Ok(value)  
✔ Err(error)  

---

## Termos frequentemente confundidos

### Cliente vs Usuário

Cliente:

✔ entidade de negócio (cadastro, domínio funcional)

Usuário:

✔ identidade que opera o sistema

Nunca misturar.

---

### Autenticação vs Autorização

Autenticação:

✔ Quem é

Autorização:

✔ O que pode fazer

---

### Locatário vs Usuário

Locatário:

✔ Escopo / isolamento

Usuário:

✔ Identidade

---

## Convenções críticas para consistência

Sempre usar:

✔ locatarioId  
✔ usuarioId  
✔ permissao  
✔ papel  
✔ ctx  

Evitar variações arbitrárias.

---

## Benefícios para IA / Copilot

Glossário bem definido:

✔ reduz sugestões inconsistentes  
✔ evita nomes conflitantes  
✔ melhora inferência de contexto  
✔ estabiliza arquitetura  

IA depende fortemente de **consistência semântica**.

---

## Regra de ouro do projeto

Código, testes e documentação devem usar os MESMOS termos.