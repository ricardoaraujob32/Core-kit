CREATE TABLE IF NOT EXISTS transacoes (
    transacao_id UUID DEFAULT gen_random_uuid(),
    locatario_id UUID NOT NULL,
    cliente_id UUID NULL,
    fornecedor_id UUID NULL,
    ordem_servico_id UUID NULL,
);