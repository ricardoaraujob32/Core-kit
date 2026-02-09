# Módulo: Usuários

## Objetivo
Concentrar regras de negócio e contratos (interfaces) relacionados a usuários do locatário.

## Responsabilidades
- Tipos de domínio: Usuario, NovoUsuario, IdUsuario (etc.)
- Validações e normalizações (ex.: nome)
- Casos de uso (usecases): criarUsuario, listarUsuarios, ...
- Contratos de persistência (porta): RepositorioUsuarios

## Contratos (Portas)
- RepositorioUsuarios:
  - create(...)
  - findById(...)
  - findByNome(...)
  - list(...)

## Invariantes sugeridas
- Nome não vazio e com tamanho mínimo
- Operações sempre vinculadas a `locatarioId`
- Autorização via permissões no ContextoExecucao (RBAC)
