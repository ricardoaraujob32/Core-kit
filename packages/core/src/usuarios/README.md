# Módulo: Usuários (core)

## Objetivo
Centralizar o domínio de usuários do sistema (entidade, validações e casos de uso) de forma independente de infraestrutura.

## Arquivos
- `tipos.ts`: tipos do domínio (Usuario, NovoUsuario, StatusUsuario, UsuarioId).
- `validadores.ts`: normalização e validação de nome.
- `portasRepositorio.ts`: contrato do repositório (porta).
- `repositorioMemoria.ts`: adapter em memória (testes/dev).
- `usecases/criarUsuario.ts`: cria usuário com validações e auditoria.
- `usecases/listarUsuarios.ts`: lista usuários do locatário.

## Regras do domínio
- Nome é normalizado com `normalizarNome`.
- Nome deve ter 3..120 caracteres após normalização.
- Não permitir duplicidade de nome por locatário (checado no caso de uso).
- Autorização:
  - `USUARIOS_CRIAR` para criar
  - `USUARIOS_LER` para listar

## Dependências (injeção)
- `RepositorioUsuarios`: persistência (porta).
- `AuditoriaWriter`: registro de ações (porta).

## Result (ROP)
Casos de uso retornam `Result<Sucesso, ErroApp>` e não lançam exceções de negócio.
