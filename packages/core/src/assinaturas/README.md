# Módulo: Assinaturas (Plano do Locatário)

## Objetivo
Representar o estado contratual do locatário (assinatura) e permitir bloqueio/liberação.

## Por que existe
- O plano define "o que é permitido".
- A assinatura define "se está ativo/pago" e "qual plano está vigente".

## Responsabilidades
- Estado da assinatura: ATIVA, PENDENTE, CANCELADA, SUSPENSA (exemplos)
- Datas: início, fim, próxima cobrança
- Política de bloqueio: por padrão, bloquear tudo se assinatura não estiver ATIVA

## Integração com planos
Assinatura aponta para um Plano (por id/código), e o Plano lista módulos/limites.
