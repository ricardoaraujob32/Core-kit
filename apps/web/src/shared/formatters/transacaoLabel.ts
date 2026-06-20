
export function formatTransacaoTitulo(transacao: any): string {
  return `${transacao.tipo ?? "Transação"} — ${transacao.criadoEm ?? ""}`;
}

export function formatTransacaoLabel(transacao: any): string {
  const pessoa =
    transacao.pessoaNome ??
    transacao.clienteNome ??
    transacao.fornecedorNome ??
    "Pessoa não informada";

  return `${formatTransacaoTitulo(transacao)} — ${pessoa}`;
}

export const formatTransacaoOptionLabel = formatTransacaoLabel;
