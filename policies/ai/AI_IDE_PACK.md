# 🤖 AI IDE PACK (Copilot/ChatGPT) — Padrão Oficial
Empresa AI-Driven — Versão 1.0

Este pacote define como usar agentes no IDE (Copilot/ChatGPT) **sem quebrar contratos** do projeto:
- Clean Architecture / Ports / Usecases
- Multi-tenant obrigatório (ctx.locatarioId é autoridade)
- Erros tipados (AppErrorCode)
- Autorização por permissões (assertPermissao)
- TDD com Vitest (preferencial / obrigatório para regras)

---

## 1) Regras de Ouro (não negociáveis)

1. IA não “adivinha” arquitetura: **abra os arquivos âncora** antes de pedir código.
2. Se repetiu 2x, padronize (template, helper, port).
3. Use contratos executáveis (types/interfaces) para guiar IA.
4. TDD (Vitest) como trilho: teste primeiro, IA implementa o mínimo, refatorar com testes verdes.

---

## 2) Como usar no dia a dia (loop curto)

### Loop XP + IA (5–15 min)
1. Escolha micro-requisito (1 comportamento)
2. Escreva teste Vitest (falhando)
3. Peça à IA implementação mínima
4. Rode testes (passar)
5. Refatore mantendo testes verdes
6. Commit pequeno

### Definition of Done (DoD) mínimo por micro-entrega
- Testes verdes
- Sem lógica de negócio em handler
- Sem locatarioId vindo do cliente
- Erros tipados + mapeados
- Permissões verificadas quando aplicável

---

## 3) Arquivos Âncora (obrigatório abrir)

Abra estes arquivos ao lado do arquivo que será editado:
- docs/anchors/ARCHITECTURE.md
- docs/anchors/CONVENTIONS.md
- docs/anchors/ERRORS.md
- docs/anchors/PERMISSIONS.md
- docs/anchors/TENANCY.md
- docs/anchors/TOKENS.md
- docs/anchors/AUTH_FLOW.md
- docs/anchors/GLOSSARY.md

Regra: se a IA “inventar” permissões/erros, exponha os catálogos e peça para usar **somente** valores existentes.

---

## 4) Blocos copiáveis (cole no topo do arquivo)

Veja:
- policies/ai/AI_IDE_RULES_USECASE.md
- policies/ai/AI_IDE_RULES_HANDLER.md

---

## 5) Prompts padrão (Copilot Chat / ChatGPT)

Veja:
- policies/ai/AI_IDE_PROMPTS.md

---

## 6) Checklist por commit / PR

Veja:
- policies/ai/AI_CODE_REVIEW_CHECKLIST_COMPILADO.md

---

## 7) Troubleshooting rápido

Veja:
- policies/ai/AI_IDE_TROUBLESHOOTING_COMPILADO.md

---

## 8) Saída documental mínima (para aderir aos contratos)

Quando usar IA no IDE para implementar algo de Sprint:
- Atualize/produza os arquivos exigidos pelo contrato do Engenheiro (docs/sprints/sprint_X/*)
- Mantenha um “mapa de testes” e “relatório TDD” mínimos

Se não gerar os artefatos, o pipeline/CI deve bloquear (governança por sistema, não por confiança).
