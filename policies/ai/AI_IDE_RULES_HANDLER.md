# 📌 RULES — HANDLER HTTP (cole no topo do arquivo)
Versão 1.0

Rules:
- Handler is adapter only (parse + call usecase + map Result->HTTP)
- Never do business rules here
- Never accept locatarioId from client as authority
- Token validated in adapter (signature/exp)
- Map AppErrorCode consistently (no strings soltas)

Mini checklist:
- [ ] handler só parse/validate/map
- [ ] ctx construído a partir do token (locatarioId/usuarioId)
- [ ] usecase faz permissão e regra
- [ ] Result -> HTTP mapeado de forma consistente
