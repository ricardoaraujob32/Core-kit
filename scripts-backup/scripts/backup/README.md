# Scripts de Backup — Mini SaaS

Este pacote implementa o backup operacional básico por scripts.

## Estratégia

- Backup do banco principal com `pg_dump --format=custom`.
- Arquivos `.dump` compactados internamente pelo PostgreSQL.
- Restauração com `pg_restore`.
- Restore preventivo opcional em um BD auxiliar.
- Retenção local simples por número de dias.

## Arquivo de configuração

Crie um arquivo `.env.backup` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mini_saas"
RESTORE_DATABASE_URL="postgresql://usuario:senha@localhost:5432/mini_saas_restore"

BACKUP_DIR="./backups"
BACKUP_RETENTION_DAYS=7
BACKUP_PREFIX="mini-saas"
APP_ENV="development"

# opcional
RUN_PREVENTIVE_RESTORE=false
AUTO_CONFIRM_AUX_RESTORE=false
RUN_AUX_VALIDATION=true
```

## Scripts

### Gerar backup

```bash
bash scripts/backup/backup-db.sh
```

### Validar backup

```bash
bash scripts/backup/validar-backup.sh backups/mini-saas_YYYY-MM-DD_HH-MM-SS.dump
```

### Listar backups

```bash
bash scripts/backup/listar-backups.sh
```

### Limpar backups antigos

```bash
bash scripts/backup/limpar-backups-antigos.sh
```

### Restaurar em BD configurado por `DATABASE_URL`

```bash
bash scripts/backup/restore-db.sh backups/arquivo.dump
```

Em produção, o restore direto é bloqueado por padrão. Para liberar:

```bash
FORCE_PRODUCTION_RESTORE=true bash scripts/backup/restore-db.sh backups/arquivo.dump
```

### Restaurar preventivamente no BD auxiliar

```bash
bash scripts/backup/restore-aux-db.sh backups/arquivo.dump
```

Para rodar sem confirmação interativa:

```bash
AUTO_CONFIRM_AUX_RESTORE=true bash scripts/backup/restore-aux-db.sh backups/arquivo.dump
```

### Backup + restore preventivo

```bash
bash scripts/backup/backup-and-restore-aux.sh
```

## Cron diário

Exemplo: backup diário às 03:00 e restore preventivo no BD auxiliar.

```cron
0 3 * * * cd /caminho/projeto && AUTO_CONFIRM_AUX_RESTORE=true bash scripts/backup/backup-and-restore-aux.sh >> logs/backup.log 2>&1
```

Exemplo: limpeza diária às 04:00.

```cron
0 4 * * * cd /caminho/projeto && bash scripts/backup/limpar-backups-antigos.sh >> logs/backup-clean.log 2>&1
```

## Observações

Este módulo é operacional externo ao aplicativo.

Ele não substitui a futura funcionalidade de backup lógico por locatário dentro do app. Para restauração por locatário, a estratégia futura será:

1. restaurar o `.dump` no BD auxiliar;
2. validar o BD auxiliar;
3. extrair dados do locatário desejado;
4. aplicar no BD principal com processo controlado.
