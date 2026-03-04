# 🏛 POLÍTICA OFICIAL DE ARQUITETURA
Empresa AI-Driven – Versão 1.0

---

# 1. PRINCÍPIOS

- Modularidade obrigatória
- Separação clara de responsabilidades
- Dependência sempre do domínio para fora
- Arquitetura limpa (Clean Architecture)
- Contratos explícitos entre módulos

---

# 2. ESTRUTURA PADRÃO DE MÓDULO

Cada módulo deve conter:

- usecases
- tipos
- validadores
- erros
- portasRepositorio
- repositorioMemoria
- index

---

# 3. REGRAS ESTRUTURAIS

- Usecases não conhecem infraestrutura
- Infra depende do domínio
- Banco nunca define regra de negócio
- Multi-tenant deve ser explícito em todas operações persistentes

---

# 4. TESTES ARQUITETURAIS

- Não pode haver import circular
- Não pode haver dependência de infra no domínio
- Cada módulo deve possuir teste unitário mínimo

---

# 5. AUTORIDADE

O Arquiteto pode vetar:
- Violação estrutural
- Acoplamento indevido
- Mudança que quebre padrão oficial
