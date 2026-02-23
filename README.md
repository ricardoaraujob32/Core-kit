# Core-kit

Armazena uma biblioteca de módulos para múltiplos projetos

## 🧭 Processo de Desenvolvimento — Core Kit

### 📌 Fluxo padrão

1. Criar Issue
2. Criar branch a partir da Issue
3. Desenvolver com testes
4. Abrir PR
5. CI valida
6. Merge fecha Issue

---

### 🗂️ Kanban

Colunas:

- Backlog
- A fazer
- Em progresso
- Em revisão
- Concluído

Regras:

- Apenas 1 tarefa em progresso por pessoa
- Issue só é concluída com CI verde

---

### 🧪 Testes

- Todo módulo novo **exige testes**
- Serialização previsível é obrigatória
- Testes documentam o contrato público

---

### ❌ Erros e Result

- Erros seguem contrato padronizado
- `Result<T, E>` evita exceções de fluxo
- Type guards garantem segurança em runtime

---

### 🔐 Permissões (RBAC)

- Permissões são declarativas
- Falha sempre retorna erro explícito
- Mensagem padrão: **"Permissões insuficientes"**

# EXTRA: CHECKLIST “COPILOT-FRIENDLY” (para colar no README)

- Pastas previsíveis: domain / ports / usecases / web / tests
- Interfaces explícitas (ports) com contratos claros
- Tipos/VOs bem nomeados (LocatarioId, UsuarioId, etc.)
- Comentário de intenção no topo de cada usecase:
  - objetivo
  - permissões necessárias
  - regras e edge cases
  - erros esperados
- Catálogo central de AppErrorCode
- ContextoExecucao obrigatório em todas as operações
- Testes Vitest descrevendo comportamento (TDD)
