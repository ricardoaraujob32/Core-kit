// apps/web/src/shared/formatters/domainLabels.ts

type ClienteLike = {
  nome?: string | null;
  documento?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
};

type FornecedorLike = {
  nome?: string | null;
  documento?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
};

type ProdutoLike = {
  nome?: string | null;
  codigo?: string | null;
  sku?: string | null;
  unidade?: string | null;
  tipo?: string | null;
};

type UsuarioLike = {
  nome?: string | null;
  email?: string | null;
};

type LocatarioLike = {
  nome?: string | null;
  nomeFantasia?: string | null;
  slug?: string | null;
};

type TransacaoLike = {
  tipo?: string | null;
  status?: string | null;
  criadoEm?: string | null;
  data?: string | null;
  clienteNome?: string | null;
  fornecedorNome?: string | null;
  pessoaNome?: string | null;
  valorTotal?: number | string | null;
};

function clean(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Mantido para áreas técnicas, especialmente superadmin, auditoria e suporte.
 * Evite usar este helper como label visual principal em telas tenant.
 */
export function shortCode(id?: string | null, size = 8): string {
  const value = clean(id);
  return value ? value.slice(0, size).toUpperCase() : "—";
}

function formatDateTimeLabel(value?: string | null): string | null {
  const raw = clean(value);
  if (!raw) return null;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoneyLabel(value?: number | string | null): string | null {
  if (value === null || value === undefined || value === "") return null;

  const numberValue = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function joinLabelParts(parts: Array<string | null | undefined>, separator = " — "): string {
  return parts.filter((part): part is string => Boolean(clean(part))).join(separator);
}

function documentoPessoa(pessoa?: ClienteLike | FornecedorLike | null): string | null {
  return clean(pessoa?.documento) ?? clean(pessoa?.cpf) ?? clean(pessoa?.cnpj);
}

function contatoPessoa(pessoa?: ClienteLike | FornecedorLike | null): string | null {
  return documentoPessoa(pessoa) ?? clean(pessoa?.telefone) ?? clean(pessoa?.email);
}

export function formatClienteLabel(cliente?: ClienteLike | null): string {
  if (!cliente) return "Cliente não informado";

  const nome = clean(cliente.nome) ?? "Cliente sem nome";
  const contato = contatoPessoa(cliente);

  return contato ? `${nome} — ${contato}` : `${nome} — sem contato`;
}

export function formatClienteOptionLabel(cliente?: ClienteLike | null): string {
  return formatClienteLabel(cliente);
}

export function formatFornecedorLabel(fornecedor?: FornecedorLike | null): string {
  if (!fornecedor) return "Fornecedor não informado";

  const nome = clean(fornecedor.nome) ?? "Fornecedor sem nome";
  const contato = contatoPessoa(fornecedor);

  return contato ? `${nome} — ${contato}` : `${nome} — sem contato`;
}

export function formatFornecedorOptionLabel(fornecedor?: FornecedorLike | null): string {
  return formatFornecedorLabel(fornecedor);
}

export function formatProdutoLabel(produto?: ProdutoLike | null): string {
  if (!produto) return "Produto não informado";

  const nome = clean(produto.nome) ?? "Produto sem nome";
  const codigo = clean(produto.codigo) ?? clean(produto.sku);
  const unidade = clean(produto.unidade);

  if (codigo && unidade) return `${nome} — Código ${codigo} • ${unidade}`;
  if (codigo) return `${nome} — Código ${codigo}`;
  if (unidade) return `${nome} — ${unidade}`;

  return `${nome} — sem código`;
}

export function formatProdutoOptionLabel(produto?: ProdutoLike | null): string {
  return formatProdutoLabel(produto);
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
  const dataHora = formatDateTimeLabel(params.criadoEm);

  if (dataHora) {
    return `${tipo} • ${dataHora}`;
  }

  // Em tenant, preferimos não exibir fallback com ID.
  return tipo;
}

export function formatTransacaoLabel(transacao?: TransacaoLike | null): string {
  if (!transacao) return "Transação não informada";

  const tipo = clean(transacao.tipo) ?? "Transação";
  const data = formatDateTimeLabel(transacao.criadoEm ?? transacao.data);
  const pessoa =
    clean(transacao.pessoaNome) ??
    clean(transacao.clienteNome) ??
    clean(transacao.fornecedorNome);
  const valor = formatMoneyLabel(transacao.valorTotal);
  const status = clean(transacao.status);

  const principal = joinLabelParts([tipo, data]);
  const secundario = joinLabelParts([pessoa, valor, status], " • ");

  return secundario ? `${principal} — ${secundario}` : principal;
}

export function formatTransacaoOptionLabel(transacao?: TransacaoLike | null): string {
  return formatTransacaoLabel(transacao);
}

export function formatOrdemServicoTitulo(params: {
  numero?: string | number | null;
  titulo?: string | null;
  criadoEm?: string | null;
  fallbackId?: string | null;
}): string {
  if (params.numero !== null && params.numero !== undefined && String(params.numero).trim()) {
    return `OS nº ${params.numero}`;
  }

  const titulo = clean(params.titulo);
  if (titulo) return titulo;

  const dataHora = formatDateTimeLabel(params.criadoEm);
  if (dataHora) return `OS • ${dataHora}`;

  // Em tenant, preferimos não exibir fallback com ID.
  return "Ordem de serviço";
}
