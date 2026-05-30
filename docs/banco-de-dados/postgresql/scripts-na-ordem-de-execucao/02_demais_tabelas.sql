CREATE TABLE core.assinaturas (
  assinatura_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS audit.auditoria_locatario (
  auditoria_id         UUID DEFAULT gen_random_uuid(),
  locatario_id         UUID NOT NULL,
  usuario_id           UUID NOT NULL,
  evento               TEXT NOT NULL, -- evento gerado
  sucesso              BOOLEAN NOT NULL,
  erro_codigo          TEXT NULL,
  erro_mensagem        TEXT NULL,
  entidade_nome        TEXT NULL,
  entidade_tipo        TEXT NULL, -- nome da entidade/DTO/tabela
  entidade_id          TEXT NULL, -- id/chave primária da entidade. Se composta, usar padrão: {entidade:chave}{entidade:chave}
  origem               TEXT NULL,
  requisicao_id        TEXT NULL,
  endereco_ip          INET NULL, 
  agente_usuario       TEXT NULL,
  agente_tipo          TEXT NULL,
  metadados            JSONB NOT NULL DEFAULT '{}'::jsonb, -- informação adicional, tudo que não tiver campo próprio
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit.auditoria_plataforma (
  auditoria_id         UUID DEFAULT gen_random_uuid(),
  usuario_id           UUID NOT NULL,
  locatario_alvo_id    UUID NULL,
  evento               TEXT NOT NULL, -- evento gerado
  sucesso              BOOLEAN NOT NULL,
  erro_codigo          TEXT NULL,
  erro_mensagem        TEXT NULL,     
  entidade_nome        TEXT NULL,
  entidade_tipo        TEXT NULL, -- nome da entidade/tabela
  entidade_id          TEXT NULL, -- id/chave primária da entidade, possivelmente composta. Padrão: {entidade:chave}{entidade:chave}
  origem               TEXT NULL,
  requisicao_id        TEXT NULL,
  endereco_ip          INET NULL, 
  agente_usuario       TEXT NULL,
  agente_tipo          TEXT NULL,
  metadados            JSONB NOT NULL DEFAULT '{}'::jsonb, -- informação adicional, tudo que não tiver campo próprio
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.clientes (
  cliente_id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,

  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  documento TEXT NULL,
  email TEXT NULL CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'),
  telefone TEXT NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

-- ESTOQUES (depósitos) 
CREATE TABLE IF NOT EXISTS core.estoques (
  locatario_id UUID NOT NULL,
  estoque_id UUID NOT NULL DEFAULT gen_random_uuid(),

  nome TEXT NOT NULL,
  padrao BOOLEAN NOT NULL DEFAULT true, -- apenas 1 estoque por locatário, ativado automaticamente

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(), -- atualizado por trigger
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

CREATE TABLE IF NOT EXISTS jobs.exportacoes (
  exportacao_id         UUID DEFAULT gen_random_uuid(),
  locatario_id          UUID NOT NULL,
  criado_por_usuario_id UUID NULL,
  formato               jobs.formato_exportacao NOT NULL,
  status                jobs.status_job NOT NULL DEFAULT 'PENDENTE',
  parametros            JSONB NOT NULL DEFAULT '{}'::jsonb, -- filtros, colunas, período etc.
  referencia_resultado  TEXT NULL, -- link/caminho do arquivo gerado
  mensagem_erro         TEXT NULL,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.fornecedores (
  fornecedor_id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,

  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  documento TEXT NULL,
  email TEXT NULL CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$'),
  telefone TEXT NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

CREATE TABLE IF NOT EXISTS jobs.importacoes (
  importacao_id         UUID DEFAULT gen_random_uuid(),
  locatario_id          UUID NOT NULL,
  criado_por_usuario_id UUID NULL,
  tipo_origem           jobs.tipo_origem_importacao NOT NULL,
  referencia_origem     TEXT NULL, -- caminho/URL/id do arquivo/planilha
  status                jobs.status_job NOT NULL DEFAULT 'PENDENTE',
  mapeamento_colunas    JSONB NOT NULL DEFAULT '{}'::jsonb, -- mapeamento do arquivo -> campos do sistema
  estatisticas          JSONB NOT NULL DEFAULT '{}'::jsonb, -- contagens, erros, métricas etc.
  mensagem_erro         TEXT NULL,
  iniciado_em           TIMESTAMPTZ NULL,
  finalizado_em         TIMESTAMPTZ NULL,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs.itens_importacao (
  item_id          UUID DEFAULT gen_random_uuid(),
  importacao_id    UUID NOT NULL,
  locatario_id     UUID NOT NULL,
  numero_linha     INTEGER NOT NULL,
  dados_brutos     JSONB NOT NULL, -- conteúdo original da linha (colunas/valores)
  status           jobs.status_job NOT NULL DEFAULT 'PENDENTE',
  detalhe_erro     TEXT NULL,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.itens_transacao (
  locatario_id UUID NOT NULL,
  item_transacao_id UUID NOT NULL DEFAULT gen_random_uuid(),
  transacao_id UUID NOT NULL,
  produto_id UUID NOT NULL,
  estoque_id UUID NOT NULL,

  valor NUMERIC(18,3) NOT NULL, 

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

CREATE TABLE IF NOT EXISTS core.limites_plano (
  plano_id       UUID NOT NULL,
  limite_plano_id TEXT NOT NULL CHECK (limite_id ~ '^[A-Z0-9_]+$'),
  valor_inteiro  INTEGER NULL CHECK (valor_inteiro IS NULL OR valor_inteiro >= 0),
  valor_texto    TEXT NULL,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
);

CREATE TABLE IF NOT EXISTS core.modulos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      TEXT NOT NULL UNIQUE CHECK (codigo ~ '^[A-Z0-9_]+$'), -- Identificador técnico estável (usado em regras)
  nome        TEXT NOT NULL, -- Nome amigável
  categoria   core.categoria_modulos NOT NULL, 
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  gratuito    BOOLEAN NOT NULL DEFAULT FALSE,
  ordem_exibicao INTEGER NOT NULL DEFAULT 0,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),  
)

CREATE TABLE IF NOT EXISTS core.modulos_locatario (
  locatario_id UUID NOT NULL,
  modulo_id UUID NOT NULL,

  habilitado BOOLEAN NOT NULL DEFAULT TRUE,

  origem core.origem_plano NOT NULL DEFAULT 'PLANO',

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
);

CREATE TABLE IF NOT EXISTS core.modulos_plano (
  plano_id   UUID NOT NULL,
  modulo_id  UUID NOT NULL,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
);

-- MOVIMENTOS (delta pode ser negativo no AJUSTE)
CREATE TABLE IF NOT EXISTS core.movimentacoes_estoque (
  movimentacao_id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,  
  estoque_id UUID NOT NULL,
  produto_id UUID NOT NULL,
  transacao_id UUID NOT NULL,
  item_transacao_id UUID NOT NULL,
  
  tipo core.tipo_movimento_estoque NOT NULL,
  delta NUMERIC(18,3) NOT NULL CHECK (delta <> 0), -- +quantidade para ENTRADA, -quantidade para SAIDA, e livre (mas consistente) para AJUSTE
  quantidade NUMERIC(18,3) NOT NULL CHECK (quantidade > 0), -- sempre positiva
  ocorrencia_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  detalhes JSONB NOT NULL DEFAULT '{}'::jsonb, -- informação adicional

  referencia TEXT NULL, -- nro doc, pedido, observação
  observacao TEXT NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por UUID NULL
);

CREATE TABLE IF NOT EXISTS core.ordens_servico (
  ordem_servico_id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,

  cliente_id UUID NULL,

  status core.status_os NOT NULL DEFAULT 'ABERTA',

  titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
  descricao TEXT NULL,

  aberta_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  fechada_em TIMESTAMPTZ NULL,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

CREATE TABLE IF NOT EXISTS core.produtos (
  produto_id UUID NOT NULL DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,
  sku TEXT NULL,
  nome TEXT NOT NULL,
  unidade TEXT NULL DEFAULT 'UN', -- UN, KG, etc
  tipo TEXT NOT NULL CHECK (tipo IN ('PRODUTO','SERVICO')),
  ativo BOOLEAN NOT NULL DEFAULT true,

  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

CREATE TABLE IF NOT EXISTS core.transacoes (
  transacao_id UUID DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL,
  cliente_id UUID NULL,
  fornecedor_id UUID NULL,
  ordem_servico_id UUID NULL,

  tipo TEXT NOT NULL CHECK (tipo IN ('VENDA','COMPRA')),
  origem TEXT NOT NULL CHECK (origem IN ('AVULSA','ORDEM_SERVICO')),
  valor NUMERIC(18,3) NOT NULL,
  vencimento_em TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ABERTA', 'EM_PROCESSAMENTO', 'AGUARDANDO_PAGAMENTO', 'ENVIADA', 'CONCLUIDA')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  excluido_em TIMESTAMPTZ NULL,
  excluido_por UUID NULL,
  excluido_motivo TEXT NULL
);

ALTER TABLE core.assinaturas OWNER TO posse;

ALTER TABLE audit.auditoria_locatario OWNER TO posse;

ALTER TABLE audit.auditoria_plataforma OWNER TO posse;

ALTER TABLE core.estoques OWNER TO posse;

ALTER TABLE core.clientes OWNER TO posse;

ALTER TABLE jobs.exportacoes OWNER TO posse;

ALTER TABLE core.fornecedores OWNER TO posse;

ALTER TABLE jobs.importacoes OWNER TO posse;

ALTER TABLE jobs.itens_importacao OWNER TO posse;

ALTER TABLE core.itens_transacao OWNER TO posse;

ALTER TABLE core.limites_plano OWNER TO posse;

ALTER TABLE core.modulos OWNER TO posse;

ALTER TABLE core.modulos_locatario OWNER TO posse;

ALTER TABLE core.modulos_plano OWNER TO posse;

ALTER TABLE core.ordens_servico OWNER TO posse;

ALTER TABLE core.movimentacoes_estoque OWNER TO posse;

ALTER TABLE core.produtos OWNER TO posse;

ALTER TABLE core.transacoes OWNER TO posse;








