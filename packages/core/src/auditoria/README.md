# Módulo Auditoria

## Objetivo

Responsável pelo registro e consulta de eventos de auditoria do locatário e da plataforma.

## Escopo

- registrar evento de auditoria do locatário
- listar auditoria do locatário
- registrar evento de auditoria da plataforma
- listar auditoria da plataforma

## Regras

- `auditoria_locatario` é tenant-scoped
- `auditoria_plataforma` é platform-only
- auditoria é append-only
- o Core nunca atualiza nem remove eventos
- ações críticas devem gerar auditoria

## Observações

A coerência final de contexto e RLS é garantida no banco.
O Core modela intenção, payload e consulta.