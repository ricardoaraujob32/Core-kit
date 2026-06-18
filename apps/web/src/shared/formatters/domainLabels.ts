// apps/web/src/shared/formatters/domainLabels.ts

type ClienteLike = { nome?: string | null; documento?: string | null; email?: string | null };
type FornecedorLike = { nome?: string | null; documento?: string | null; email?: string | null };
type ProdutoLike = { nome?: string | null; sku?: string | null; unidade?: string | null };
type UsuarioLike = { nome?: string | null; email?: string | null };
type LocatarioLike = { nome?: string | null; nomeFantasia?: string | null; slug?: string | null };

function clean(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function shortCode(id?: string | null, size = 8): string {
  const value = clean(id);
  return value ? value.slice(0, size).toUpperCase() : "—";
}

export function formatClienteLabel(cliente?: ClienteLike | null): string {
  if (!cliente) return "Cliente não informado";

  const nome = clean(cliente.nome) ?? "Cliente sem nome";
  const documento = clean(cliente.documento);
  const email = clean(cliente.email);

  if (documento) return `${nome} — ${documento}`;
  if (email) return `${nome} — ${email}`;

  return nome;
}

export function formatFornecedorLabel(fornecedor?: FornecedorLike | null): string {
  if (!fornecedor) return "Fornecedor não informado";

  const nome = clean(fornecedor.nome) ?? "Fornecedor sem nome";
  const documento = clean(fornecedor.documento);
  const email = clean(fornecedor.email);

  if (documento) return `${nome} — ${documento}`;
  if (email) return `${nome} — ${email}`;

  return nome;
}

export function formatProdutoLabel(produto?: ProdutoLike | null): string {
  if (!produto) return "Produto não informado";

  const nome = clean(produto.nome) ?? "Produto sem nome";
  const sku = clean(produto.sku);
  const unidade = clean(produto.unidade);

  if (sku && unidade) return `${nome} — SKU ${sku} • ${unidade}`;
  if (sku) return `${nome} — SKU ${sku}`;
  if (unidade) return `${nome} — ${unidade}`;

  return nome;
}

export function formatUsuarioLabel(usuario?: UsuarioLike | null): string {
  if (!usuario) return "Usuário não informado";

  const nome = clean(usuario.nome) ?? "Usuário sem nome";
  const email = clean(usuario.email);

  return email ? `${nome} — ${email}` : nome;
}

export function formatLocatarioLabel(locatario?: LocatarioLike | null): string {
  if (!locatario) return "Locatário não informado";

  const nome =
    clean(locatario.nomeFantasia) ??
    clean(locatario.nome) ??
    "Locatário sem nome";
  const slug = clean(locatario.slug);

  return slug ? `${nome} — ${slug}` : nome;
}

export function formatTransacaoTitulo(params: {
  tipo?: string | null;
  criadoEm?: string | null;
  fallbackId?: string | null;
}): string {
  const tipo = clean(params.tipo) ?? "Transação";

  if (params.criadoEm) {
    const date = new Date(params.criadoEm);

    if (!Number.isNaN(date.getTime())) {
      const dataHora = date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return `${tipo} • ${dataHora}`;
    }
  }

  return `${tipo} • Ref. ${shortCode(params.fallbackId)}`;
}

export function formatOrdemServicoTitulo(params: {
  criadoEm?: string | null;
  fallbackId?: string | null;
}): string {
  if (params.criadoEm) {
    const date = new Date(params.criadoEm);

    if (!Number.isNaN(date.getTime())) {
      const dataHora = date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return `OS • ${dataHora}`;
    }
  }

  return `OS • Ref. ${shortCode(params.fallbackId)}`;
}
