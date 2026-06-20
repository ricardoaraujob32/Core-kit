
import { cleanText } from "./commonLabel";

export function formatClienteContato(cliente: any): string {
  return cliente.documento ?? cliente.telefone ?? cliente.email ?? "sem contato";
}

export function formatClienteLabel(cliente: any): string {
  return `${cleanText(cliente.nome) ?? "Cliente sem nome"} — ${formatClienteContato(cliente)}`;
}

export const formatClienteOptionLabel = formatClienteLabel;
