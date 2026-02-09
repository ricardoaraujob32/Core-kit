# Core Kit - Core

## Ideia
Este pacote contém regras de negócio e contratos (hexágono), sem dependência de framework web.

## Exportações
- result (ok/err)
- errors (AppError/appError)
- rbac (autorização por permissões)
- locatario/contextoExecucao
- módulos de domínio: usuarios, planos, assinaturas, auditoria

## Testes
Rodar:
- pnpm -C packages/core test
