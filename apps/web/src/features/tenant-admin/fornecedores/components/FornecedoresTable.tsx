// apps/web/src/features/tenant-admin/fornecedores/components/FornecedoresTable.tsx

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
import { formatDate, formatFornecedorLabel } from "../../../../shared/formatters";
import type { Fornecedor } from "../tipos";

type Props = { itens: Fornecedor[] };
type FornecedorFilterKey = "fornecedor" | "contato" | "criadoEm";

export function FornecedoresTable({ itens }: Props) {
  const table = useTableFilters<Fornecedor, FornecedorFilterKey>(
    itens,
    { fornecedor: "", contato: "", criadoEm: createDateRangeFilter() },
    (fornecedor, filters) =>
      matchesFilter(fornecedor.nome, filters.fornecedor) &&
      matchesFilter(`${fornecedor.documento ?? ""} ${fornecedor.telefone ?? ""} ${fornecedor.email ?? ""}`, filters.contato) &&
      matchesDateRange(fornecedor.criadoEm, filters.criadoEm as { from: string; to: string }),
  );

  if (itens.length === 0) return <div className="ck-register-empty">Nenhum fornecedor encontrado</div>;

  return (
    <div className="ck-register-table-panel">
      <table className="ck-register-table">
        <thead>
          <tr>
            <th><TableHeaderFilter label="Fornecedor" value={table.filters.fornecedor as string} placeholder="Nome" onChange={(value) => table.setFilter("fornecedor", value)} /></th>
            <th><TableHeaderFilter label="Contato" value={table.filters.contato as string} placeholder="Documento, telefone ou e-mail" onChange={(value) => table.setFilter("contato", value)} /></th>
            <th><TableHeaderDateRangeFilter label="Cadastrado em" value={table.filters.criadoEm as { from: string; to: string }} onChange={(value) => table.setFilter("criadoEm", value)} /></th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {table.filteredItems.map((fornecedor) => (
            <tr key={fornecedor.fornecedorId}>
              <ExpandableTableCell summary={fornecedor.nome ?? "Fornecedor sem nome"} detail={<div><strong>{formatFornecedorLabel(fornecedor)}</strong><p>Documento: {fornecedor.documento ?? "Sem documento"}</p><p>Telefone: {fornecedor.telefone ?? "Sem telefone"}</p><p>E-mail: {fornecedor.email ?? "Sem e-mail"}</p></div>} />
              <td>{fornecedor.telefone ?? fornecedor.email ?? "—"}</td>
              <td>{formatDate(fornecedor.criadoEm)}</td>
              <td><div className="ck-register-row-actions"><Link className="ck-register-link" to={`/app/fornecedores/${fornecedor.fornecedorId}`}>Ver</Link><Link className="ck-register-link" to={`/app/fornecedores/${fornecedor.fornecedorId}/editar`}>Editar</Link></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
