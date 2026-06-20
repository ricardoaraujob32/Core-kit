// apps/web/src/features/tenant-admin/financeiro/components/FinanceiroTable.tsx

import { Link } from "react-router-dom";
import {
  ExpandableTableCell,
  TableHeaderDateRangeFilter,
  TableHeaderFilter,
  createDateRangeFilter,
  matchesDateRange,
  matchesFilter,
  useTableFilters,
} from "../../../../shared/table";
import { formatDate, formatMoney } from "../../../../shared/formatters";

type ContaFinanceira = {
  transacaoId: string;
  descricao?: string | null;
  tipo?: string | null;
  status?: string | null;
  pessoaNome?: string | null;
  clienteNome?: string | null;
  fornecedorNome?: string | null;
  vencimentoEm?: string | null;
  data?: string | null;
  valor?: number | string | null;
  valorTotal?: number | string | null;
};

type Props = { itens: ContaFinanceira[] };
type FinanceiroFilterKey = "conta" | "pessoa" | "status" | "data";

function pessoa(item: ContaFinanceira): string {
  return item.pessoaNome ?? item.clienteNome ?? item.fornecedorNome ?? "Pessoa não informada";
}

function titulo(item: ContaFinanceira): string {
  return item.descricao ?? item.tipo ?? "Conta financeira";
}

function statusClass(status?: string | null): string {
  switch (status) {
    case "PAGO":
    case "RECEBIDO":
    case "CONCLUIDA":
      return "ck-status ck-status-success";
    case "ATRASADO":
    case "CANCELADA":
      return "ck-status ck-status-danger";
    default:
      return "ck-status ck-status-warning";
  }
}

export function FinanceiroTable({ itens }: Props) {
  const table = useTableFilters<ContaFinanceira, FinanceiroFilterKey>(
    itens,
    { conta: "", pessoa: "", status: "", data: createDateRangeFilter() },
    (item, filters) =>
      matchesFilter(titulo(item), filters.conta) &&
      matchesFilter(pessoa(item), filters.pessoa) &&
      matchesFilter(item.status, filters.status) &&
      matchesDateRange(item.vencimentoEm ?? item.data, filters.data as { from: string; to: string }),
  );

  if (itens.length === 0) return <div className="ck-register-empty">Nenhuma conta encontrada</div>;

  return (
    <div className="ck-register-table-panel">
      <table className="ck-register-table">
        <thead>
          <tr>
            <th><TableHeaderFilter label="Conta" value={table.filters.conta as string} placeholder="Descrição ou tipo" onChange={(value) => table.setFilter("conta", value)} /></th>
            <th><TableHeaderFilter label="Pessoa" value={table.filters.pessoa as string} placeholder="Pessoa" onChange={(value) => table.setFilter("pessoa", value)} /></th>
            <th><TableHeaderDateRangeFilter label="Vencimento/Data" value={table.filters.data as { from: string; to: string }} onChange={(value) => table.setFilter("data", value)} /></th>
            <th>Valor</th>
            <th><TableHeaderFilter label="Status" value={table.filters.status as string} placeholder="Status" onChange={(value) => table.setFilter("status", value)} /></th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {table.filteredItems.map((item) => (
            <tr key={item.transacaoId}>
              <ExpandableTableCell summary={titulo(item)} detail={<div><strong>{titulo(item)}</strong><p>Pessoa: {pessoa(item)}</p><p>Valor: {formatMoney(item.valor ?? item.valorTotal)}</p><p>Data: {formatDate(item.vencimentoEm ?? item.data)}</p><p>Status: {item.status ?? "—"}</p></div>} />
              <td>{pessoa(item)}</td>
              <td>{formatDate(item.vencimentoEm ?? item.data)}</td>
              <td>{formatMoney(item.valor ?? item.valorTotal)}</td>
              <td><span className={statusClass(item.status)}>{item.status ?? "—"}</span></td>
              <td><div className="ck-register-row-actions"><Link className="ck-register-link" to={`/app/transacoes/${item.transacaoId}`}>Ver transação</Link></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
