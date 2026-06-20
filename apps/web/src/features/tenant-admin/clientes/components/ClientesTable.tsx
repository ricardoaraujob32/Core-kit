// apps/web/src/features/tenant-admin/clientes/components/ClientesTable.tsx

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
import { formatClienteLabel, formatDate } from "../../../../shared/formatters";
import type { Cliente } from "../tipos";

type Props = { itens: Cliente[] };
type ClienteFilterKey = "cliente" | "contato" | "criadoEm";

export function ClientesTable({ itens }: Props) {
  const table = useTableFilters<Cliente, ClienteFilterKey>(
    itens,
    { cliente: "", contato: "", criadoEm: createDateRangeFilter() },
    (cliente, filters) =>
      matchesFilter(cliente.nome, filters.cliente) &&
      matchesFilter(`${cliente.documento ?? ""} ${cliente.telefone ?? ""} ${cliente.email ?? ""}`, filters.contato) &&
      matchesDateRange(cliente.criadoEm, filters.criadoEm as { from: string; to: string }),
  );

  if (itens.length === 0) return <div className="ck-register-empty">Nenhum cliente encontrado</div>;

  return (
    <div className="ck-register-table-panel">
      <table className="ck-register-table">
        <thead>
          <tr>
            <th><TableHeaderFilter label="Cliente" value={table.filters.cliente as string} placeholder="Nome" onChange={(value) => table.setFilter("cliente", value)} /></th>
            <th><TableHeaderFilter label="Contato" value={table.filters.contato as string} placeholder="Documento, telefone ou e-mail" onChange={(value) => table.setFilter("contato", value)} /></th>
            <th><TableHeaderDateRangeFilter label="Cadastrado em" value={table.filters.criadoEm as { from: string; to: string }} onChange={(value) => table.setFilter("criadoEm", value)} /></th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {table.filteredItems.map((cliente) => (
            <tr key={cliente.clienteId}>
              <ExpandableTableCell summary={cliente.nome ?? "Cliente sem nome"} detail={<div><strong>{formatClienteLabel(cliente)}</strong><p>Documento: {cliente.documento ?? "Sem documento"}</p><p>Telefone: {cliente.telefone ?? "Sem telefone"}</p><p>E-mail: {cliente.email ?? "Sem e-mail"}</p></div>} />
              <td>{cliente.telefone ?? cliente.email ?? "—"}</td>
              <td>{formatDate(cliente.criadoEm)}</td>
              <td><div className="ck-register-row-actions"><Link className="ck-register-link" to={`/app/clientes/${cliente.clienteId}`}>Ver</Link><Link className="ck-register-link" to={`/app/clientes/${cliente.clienteId}/editar`}>Editar</Link></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
