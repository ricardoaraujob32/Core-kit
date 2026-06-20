
export function formatOrdemServicoTitulo(os: any): string {
  if (os.numero) {
    return `OS nº ${os.numero}`;
  }

  return os.titulo ?? "Ordem de serviço";
}

export function formatOrdemServicoLabel(os: any): string {
  return `${formatOrdemServicoTitulo(os)} — ${os.clienteNome ?? "Cliente não informado"}`;
}
