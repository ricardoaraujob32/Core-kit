# 📜 POLÍTICA OFICIAL DE TESTES  
Empresa AI-Driven – Versão 1.0

Status: Ativa  
Base metodológica: TDD (Test Driven Development)  
Aplicável a: Todos os projetos da empresa  

---

# 1. OBJETIVO

Garantir que:

- Requisitos sejam verificáveis
- Regras de negócio sejam protegidas
- Arquitetura seja respeitada
- Segurança seja auditável
- Entregas sejam previsíveis e confiáveis

Teste é considerado:

> Contrato executável entre agentes.

---

# 2. PRINCÍPIOS FUNDAMENTAIS

## 2.1 TDD Obrigatório

Toda regra de negócio nova deve seguir:

1. Red — escrever teste que falha  
2. Green — implementar para passar  
3. Refactor — melhorar mantendo comportamento  

Sem teste → não há funcionalidade concluída.

---

## 2.2 Teste é Evidência

Um requisito só é considerado implementado quando existe:

- Teste automatizado correspondente  
- Evidência de execução bem-sucedida  

---

## 2.3 Camadas de Teste

| Tipo | Valida | Obrigatório |
|------|--------|-------------|
| Unitário | Regra isolada | Sempre |
| Integração | Colaboração real entre módulos | Quando houver integração |
| Aceite | Critérios do PO | Sempre |
| Segurança | Regras de autorização e isolamento | Quando aplicável |

---

# 3. TIPOS DE TESTE (Definição Formal)

## 3.1 Testes Unitários

Validam:
- Usecases
- Validadores
- Regras de status
- Erros esperados
- RBAC em nível de aplicação (quando possível)

Regras:
- Sem acesso real a banco
- Sem rede
- Determinísticos
- Rápidos

---

## 3.2 Testes de Integração

Validam:
- Repositórios reais
- Migrações
- Transações
- Multi-tenant
- Integração entre camadas

Obrigatório quando:
- Existe persistência real
- Existe portaTransacao
- Existe isolamento por locatário

---

## 3.3 Testes de Aceite

Validam:
- Critérios de aceite do PO
- Comportamento da história

Toda história deve ter pelo menos 1 teste de aceite automatizado quando tecnicamente viável.

---

## 3.4 Testes de Segurança

Podem ser:
- Unitários
- Integração
- Aceite

Validam:
- RBAC
- Isolamento multi-tenant
- Auditoria
- Mascaramento de dados
- Bloqueio de acesso indevido

Segurança pode exigir testes adicionais antes do deploy.

---

# 4. PAPÉIS E AUTORIDADE SOBRE TESTES

## 4.1 Engenheiro de Software

Deve criar:
- Testes unitários
- Testes de integração quando aplicável

Pode criar:
- Testes de aceite

---

## 4.2 QA

Pode criar:
- Testes de aceite
- Testes de regressão
- Cenários de borda

Pode exigir:
- Testes adicionais

---

## 4.3 Segurança

Pode criar:
- Testes de autorização
- Testes de isolamento
- Testes de auditoria

Tem poder de veto:
- Se risco crítico não estiver coberto por testes

---

## 4.4 Arquiteto de Sistemas

Pode exigir:
- Testes de contrato
- Testes de invariantes arquiteturais

---

## 4.5 DBA

Pode criar:
- Testes de integração de banco
- Testes de integridade
- Testes de performance básica

---

## 4.6 Product Owner

Define:
- Critérios de aceite

---

## 4.7 Fundador / Scrum Master

Pode:
- Bloquear entrega sem DoD
- Aprovar exceções
- Registrar dívida técnica

---

# 5. DEFINITION OF DONE

Uma história é considerada “Pronta” apenas se:

- [ ] Testes unitários implementados
- [ ] Testes de integração implementados (se aplicável)
- [ ] Teste(s) de aceite implementados
- [ ] Segurança validada (se aplicável)
- [ ] Todos testes passando
- [ ] Refatoração concluída
- [ ] Sem violação arquitetural

---

# 6. EXCEÇÕES

Permitidas apenas para:
- Spikes
- Hotfix emergencial
- Código descartável

Obrigatório:
- Registro de dívida técnica
- Tarefa futura para cobrir testes
- Aprovação do Fundador

---

# 7. REGRA DE OURO

> Nenhuma funcionalidade entra em produção sem contrato executável.
