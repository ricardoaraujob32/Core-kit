# MODULE_SCAFFOLD.md

## Objetivo
Este template descreve o “scaffold” padrão para criar um módulo novo no Core Kit, seguindo:
- multi-tenant obrigatório
- usecases independentes de framework
- Result/AppError
- Vitest/TDD
- adapters HTTP (Fastify) apenas como borda

---

## Estrutura sugerida do módulo

Exemplo: módulo `clientes`


---

## Passo-a-passo (TDD)

### 1) Definir linguagem ubíqua do módulo
- Nome do agregado/entidade
- Campos essenciais
- Regras invariantes
- Erros esperados

### 2) Criar tipos/VOs do domínio
- `ClienteId`, `Email`, etc.
- Invariantes no domínio quando fizer sentido

### 3) Definir Ports (interfaces)
- Repositórios e serviços externos necessários
- Contrato claro (retorna null? lança? etc.)

### 4) Escrever teste do primeiro usecase (Vitest)
- Caso de sucesso
- Falhas esperadas
- Isolamento multi-tenant

### 5) Implementar usecase mínimo
- validação de formato
- autorização via ctx
- chamadas a ports
- retorno `Result`

### 6) Implementar repo fake/in-memory (para testes)
- Map por locatário
- cumprir contrato do port

### 7) Implementar adapter HTTP (Fastify)
- parse/validate básico
- construir ctx (já feito globalmente)
- chamar usecase
- mapear Result → HTTP

---

## Checklist de qualidade
- [ ] locatarioId sempre vem de ctx
- [ ] usecase não importa Fastify
- [ ] ports não importam infra
- [ ] testes cobrem sucesso + falhas + multi-tenant
- [ ] erros usam AppErrorCode estável