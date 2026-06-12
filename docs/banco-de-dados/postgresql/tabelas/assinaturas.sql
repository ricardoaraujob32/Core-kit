-- ASSINATURA DE PLANO POR LOCATÁRIO
-- Representa o contrato ativo entre locatário e plano.
--
-- REGRAS DE NEGÓCIO CRÍTICAS:
-- - Um locatário pode ter várias assinaturas históricas
-- - Apenas UMA assinatura pode estar ATIVA por locatário
-- - Mudança de plano cria nova assinatura (não sobrescreve histórico)
-- - Cancelamento/suspensão NÃO remove registros
--
-- STATUS:
-- - ATIVA → plano vigente
-- - SUSPENSA → acesso bloqueado temporariamente
-- - CANCELADA → encerramento definitivo
-- - EXPIRADA → fim automático
--
-- CONSISTÊNCIA:
-- - Nunca apagar registros fisicamente
-- - Datas determinam validade
CREATE TABLE core.assinaturas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locatario_id        UUID NOT NULL REFERENCES locatarios(id) ON DELETE CASCADE,
  plano_id            UUID NOT NULL REFERENCES planos(id),

  status              core.status_assinatura NOT NULL DEFAULT 'ATIVA',

  inicio_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  fim_em              TIMESTAMPTZ NULL,              -- se houver término programado
  renovacao_em        TIMESTAMPTZ NULL,              -- se você quiser “ciclo”
  motivo              TEXT NULL,                     -- por que mudou/cancelou

 -- Cobrança (mínimo)
  valor_centavos        INTEGER NOT NULL DEFAULT 0 CHECK (valor_centavos >= 0),
  ciclo                 TEXT NOT NULL DEFAULT 'MENSAL' CHECK (ciclo IN ('MENSAL','ANUAL')),

  proximo_vencimento_em TIMESTAMPTZ NULL,
  ultimo_pagamento_em   TIMESTAMPTZ NULL,

  falha_pagamento_em    TIMESTAMPTZ NULL,

  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em         TIMESTAMPTZ NULL               -- exclusão lógica (se quiser)
);

CREATE UNIQUE INDEX ux_assinatura_ativa_por_locatario
ON assinaturas(locatario_id)
WHERE status = 'ATIVA' AND excluido_em IS NULL;

