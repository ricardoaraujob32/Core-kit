# Módulo: Clientes (core)

## Objetivo
Fornecer o domínio de Clientes (tipos, validadores e casos de uso) desacoplado de persistência.

## Permissões (RBAC)
- `CLIENTES_CRIAR` para criar
- `CLIENTES_LER` para listar

## Regras do domínio (MVP)
- Nome é normalizado (`normalizarNomeCliente`) e deve ter 3..120 caracteres.
- Email é opcional, mas quando informado deve ser válido.
- Duplicidade por nome é proibida dentro do mesmo locatário.

## Portas e adapters
- `RepositorioClientes` (porta)
- `criarRepositorioClientesEmMemoria` (adapter para testes/dev)

## Result (ROP)
Casos de uso retornam `Result<Sucesso, ErroApp>` e não lançam exceções de negócio.
