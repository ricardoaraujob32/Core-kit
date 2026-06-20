
import { cleanText } from "./commonLabel";

export function formatFornecedorContato(fornecedor: any): string {
  return fornecedor.documento ?? fornecedor.telefone ?? fornecedor.email ?? "sem contato";
}

export function formatFornecedorLabel(fornecedor: any): string {
  return `${cleanText(fornecedor.nome) ?? "Fornecedor sem nome"} — ${formatFornecedorContato(fornecedor)}`;
}

export const formatFornecedorOptionLabel = formatFornecedorLabel;
