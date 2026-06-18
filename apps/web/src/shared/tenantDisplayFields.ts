// apps/web/src/shared/tenantDisplayFields.ts

export type TenantEntityDisplayRule = {
  entidade: string;
  idTecnico: string;
  titulo: readonly string[];
  subtitulo: readonly string[];
  contexto: readonly string[];
  observacao: string;
};

export const TENANT_DISPLAY_FIELDS = {
  clientes: {
    entidade: "Cliente",
    idTecnico: "clienteId",
    titulo: ["nome"],
    subtitulo: ["documento", "telefone", "email"],
    contexto: ["status", "criadoEm"],
    observacao: "Identificar cliente por nome e contato; nunca por UUID.",
  },

  fornecedores: {
    entidade: "Fornecedor",
    idTecnico: "fornecedorId",
    titulo: ["nome"],
    subtitulo: ["documento", "telefone", "email"],
    contexto: ["criadoEm"],
    observacao: "Identificar fornecedor por nome, documento ou contato.",
  },

  produtos: {
    entidade: "Produto",
    idTecnico: "produtoId",
    titulo: ["nome"],
    subtitulo: ["codigo", "precoVenda"],
    contexto: ["status", "estoqueAtual"],
    observacao: "Identificar produto por nome e código/SKU.",
  },

  transacoes: {
    entidade: "Transação",
    idTecnico: "transacaoId",
    titulo: ["tipo", "criadoEm"],
    subtitulo: ["cliente", "fornecedor", "status"],
    contexto: ["valorTotal", "quantidadeItens"],
    observacao: "Identificar venda/compra por tipo, data, pessoa e status.",
  },

  ordensServico: {
    entidade: "Ordem de Serviço",
    idTecnico: "ordemServicoId",
    titulo: ["numero", "titulo", "abertaEm"],
    subtitulo: ["cliente", "status"],
    contexto: ["fechadaEm", "transacaoGerada"],
    observacao: "Identificar OS por número, título, cliente, data e status.",
  },

  financeiro: {
    entidade: "Conta Financeira",
    idTecnico: "transacaoId",
    titulo: ["descricao", "tipo", "vencimentoEm"],
    subtitulo: ["pessoa", "status"],
    contexto: ["valor", "data"],
    observacao: "Identificar conta por descrição, vencimento, pessoa e valor.",
  },
} as const satisfies Record<string, TenantEntityDisplayRule>;

export type TenantDisplayEntity = keyof typeof TENANT_DISPLAY_FIELDS;

export function getTenantDisplayRule(
  entity: TenantDisplayEntity,
): TenantEntityDisplayRule {
  return TENANT_DISPLAY_FIELDS[entity];
}
