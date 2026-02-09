CREATE TABLE principal.assinaturas (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locatario_id        UUID NOT NULL REFERENCES principal.locatarios(id) ON DELETE CASCADE,
  plano_id            UUID NOT NULL REFERENCES principal.planos(id),

  status              TEXT NOT NULL DEFAULT 'ATIVA'
                       CHECK (status IN ('ATIVA','SUSPENSA','CANCELADA','EXPIRADA')),

  inicio_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  fim_em              TIMESTAMPTZ NULL,              -- se houver término programado
  renovacao_em        TIMESTAMPTZ NULL,              -- se você quiser “ciclo”
  motivo              TEXT NULL,                     -- por que mudou/cancelou

 -- Cobrança (mínimo)
  moeda                 TEXT NOT NULL DEFAULT 'BRL' CHECK (moeda IN ('BRL','USD','EUR')),
  valor_centavos        INTEGER NOT NULL DEFAULT 0 CHECK (valor_centavos >= 0),
  ciclo                 TEXT NOT NULL DEFAULT 'MENSAL' CHECK (ciclo IN ('MENSAL','ANUAL')),

  proximo_vencimento_em TIMESTAMPTZ NULL,
  ultimo_pagamento_em   TIMESTAMPTZ NULL,

  provedor_pagamento    TEXT NULL,          -- ex: 'stripe', 'mercadopago', 'manual'
  ref_externa           TEXT NULL,          -- id no provedor (customer/subscription/etc)
  falha_pagamento_em    TIMESTAMPTZ NULL,

  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em         TIMESTAMPTZ NULL               -- exclusão lógica (se quiser)
);

CREATE UNIQUE INDEX ux_assinatura_ativa_por_locatario
ON principal.assinaturas(locatario_id)
WHERE status = 'ATIVA' AND excluido_em IS NULL;

CREATE TABLE principal.plano_locatario (
  locatario_id  UUID PRIMARY KEY REFERENCES principal.locatarios(id) ON DELETE CASCADE,
  plano_id      UUID NOT NULL REFERENCES principal.planos(id),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_por UUID NULL REFERENCES principal.usuarios(id) ON DELETE SET NULL
);
