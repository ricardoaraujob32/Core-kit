# Catálogo de Permissões (Core Kit)

Este documento define o padrão de permissões utilizado pelos sistemas baseados no Core Kit.

## Convenção
Formato padrão:
<recurso>:<acao>

Exemplos:
- usuarios:criar
- usuarios:editar
- auditoria:ler

As permissões são strings por design, para permitir:
- customização por locatário
- evolução sem refatoração de enums
- versionamento simples

---

## Usuários
- usuarios:criar
- usuarios:listar
- usuarios:editar
- usuarios:desativar

## Locatário
- locatario:ler
- locatario:configurar
- locatario:desativar

## Auditoria
- auditoria:ler

## Importação / Exportação
- importacao:executar
- exportacao:executar

## Administração do Sistema
- sistema:administrar

---

## Observações
- Papéis (roles) são apenas agrupamentos de permissões.
- O Core Kit **não define** quais permissões pertencem a cada papel.
- A resolução papel → permissões acontece na camada de aplicação ou autenticação.
