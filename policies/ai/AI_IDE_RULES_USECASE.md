# 📌 RULES — USECASE (cole no topo do arquivo)
Versão 1.0

Rules:
- Must accept ContextoExecucao (ctx) explicitly
- locatarioId must come from ctx (never from body/query)
- Must use Result<T, AppError> (no throw for expected failures)
- Error codes must be from AppErrorCode (see error catalog)
- Permission checks via assertPermissao(ctx, "<dominio.acao>")
- Repository calls must be tenant-scoped (ctx.locatarioId)

Template de intenção (recomendado):
- Objetivo:
- Entradas (DTO):
- Saídas (DTO):
- Permissões necessárias:
- Erros esperados (AppErrorCode):
- Regras / Edge cases:
- Notas de segurança (tenant + authz):
