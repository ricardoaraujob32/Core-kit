// apps/web/src/features/tenant-admin/ordens-servico/components/OrdensServicoTable.tsx

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
import type { Cliente } from "../../clientes/tipos";
import { formatClienteLabel, formatDateTime } from "../../../../shared/formatters";
import type { OrdemServico, StatusOrdemServico } from "../tipos";
import { OrdemServicoDisplayTitle } from "./OrdemServicoDisplayTitle";

type Props = { itens: OrdemServico[]; clientes?: Cliente[] };
type OrdemServicoFilterKey = "ordem" | "cliente" | "status" | "data";

function statusClass(status: StatusOrdemServico): string {
  switch (status) {
    case "CONCLUIDA":
      return "ck-status ck-status-success";
    case "CANCELADA":
      return "ck-status ck-status-danger";
    case "EM_ANDAMENTO":
      return "ck-status";
    default:
      return "ck-status ck-status-warning";
  }
}

function clienteInfo(ordem: OrdemServico, clientesPorId: Map<string, Cliente>): string {
  if (!ordem.clienteId) return "Cliente não vinculado";
  const cliente = clientesPorId.get(ordem.clienteId);
  return cliente ? formatClienteLabel(cliente) : "Cliente não carregado";
}

export function OrdensServicoTable({ itens, clientes = [] }: Props) {
  const clientesPorId = new Map(clientes.map((cliente) => [cliente.clienteId, cliente]));

  const table = useTableFilters<OrdemServico, OrdemServicoFilterKey>(
    itens,
    { ordem: "", cliente: "", status: "", data: createDateRangeFilter() },
    (ordem, filters) =>
      matchesFilter(`${ordem.titulo ?? ""} ${ordem.descricao ?? ""}`, filters.ordem) &&
      matchesFilter(clienteInfo(ordem, clientesPorId), filters.cliente) &&
      matchesFilter(ordem.status, filters.status) &&
      matchesDateRange(ordem.criadoEm ?? ordem.abertaEm, filters.data as { from: string; to: string }),
  );

  if (itens.length === 0) return <div className="ck-register-empty">Nenhuma ordem de serviço encontrada</div>;

  return (
    <div className="ck-register-table-panel">
      <table className="ck-register-table">
        <thead>
          <tr>
            <th><TableHeaderFilter label="OS" value={table.filters.ordem as string} placeholder="Título ou descrição" onChange={(value) => table.setFilter("ordem", value)} /></th>
            <th><TableHeaderFilter label="Cliente" value={table.filters.cliente as string} placeholder="Cliente" onChange={(value) => table.setFilter("cliente", value)} /></th>
            <th><TableHeaderFilter label="Status" value={table.filters.status as string} placeholder="Status" onChange={(value) => table.setFilter("status", value)} /></th>
            <th><TableHeaderDateRangeFilter label="Aberta em" value={table.filters.data as { from: string; to: string }} onChange={(value) => table.setFilter("data", value)} /></th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {table.filteredItems.map((ordem) => {
            const cliente = clienteInfo(ordem, clientesPorId);
            return (
              <tr key={ordem.ordemServicoId}>
                <ExpandableTableCell summary={<OrdemServicoDisplayTitle ordemServico={ordem} />} detail={<div><strong><OrdemServicoDisplayTitle ordemServico={ordem} /></strong><p>Título: {ordem.titulo ?? "Sem título"}</p><p>Descrição: {ordem.descricao ?? "Sem descrição"}</p><p>Cliente: {cliente}</p><p>Status: {ordem.status}</p></div>} />
                <td>{cliente}</td>
                <td><span className={statusClass(ordem.status)}>{ordem.status}</span></td>
                <td>{formatDateTime(ordem.criadoEm ?? ordem.abertaEm)}</td>
                <td><div className="ck-register-row-actions"><Link className="ck-register-link" to={`/app/ordens-servico/${ordem.ordemServicoId}`}>Ver</Link></div></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
