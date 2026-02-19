# Módulo: Fornecedores (core)

## Objetivo
Fornecer o domínio de Fornecedores (tipos, validadores e casos de uso) desacoplado de persistência.

## Permissões (RBAC)
- `FORNECEDORES_CRIAR` para criar
- `FORNECEDORES_LER` para listar

## Regras do domínio (MVP)
- Nome é normalizado e deve ter 3..120 caracteres.
- Email é opcional; se informado, deve ser válido.
- Duplicidade por nome é proibida dentro do mesmo locatário.

## Portas e adapters
- `RepositorioFornecedores` (porta)
- `criarRepositorioFornecedoresEmMemoria` (adapter em memória)

## Result (ROP)
Casos de uso retornam `Result<Sucesso, ErroApp>` e não lançam exceções de negócio.
