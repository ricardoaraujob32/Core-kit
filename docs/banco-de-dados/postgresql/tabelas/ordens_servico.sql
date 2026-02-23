CREATE TABLE IF NOT EXISTS ordens_servico (
    ordem_servico_id UUID DEFAULT gen_random_uuid(),
    locatario_id UUID NOT NULL,
);