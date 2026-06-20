// apps/web/src/features/tenant-admin/produtos/components/ProdutosTable.tsx

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
import { formatDate, formatMoney, formatProdutoLabel } from "../../../../shared/formatters";
import type { Produto } from "../tipos";

type Props = { itens: Produto[] };
type ProdutoFilterKey = "produto" | "tipo" | "criadoEm";

export function ProdutosTable({ itens }: Props) {
  const table = useTableFilters<Produto, ProdutoFilterKey>(
    itens,
    { produto: "", tipo: "", criadoEm: createDateRangeFilter() },
    (produto, filters) =>
      matchesFilter(`${produto.nome ?? ""} ${produto.sku ?? ""} ${produto.sku ?? ""}`, filters.produto) &&
      matchesFilter(produto.tipo, filters.tipo) &&
      matchesDateRange(produto.criadoEm, filters.criadoEm as { from: string; to: string }),
  );

  if (itens.length === 0) return <div className="ck-register-empty">Nenhum produto encontrado</div>;

  return (
    <div className="ck-register-table-panel">
      <table className="ck-register-table">
        <thead>
          <tr>
            <th><TableHeaderFilter label="Produto" value={table.filters.produto as string} placeholder="Nome, código ou SKU" onChange={(value) => table.setFilter("produto", value)} /></th>
            <th><TableHeaderFilter label="Tipo" value={table.filters.tipo as string} placeholder="Tipo" onChange={(value) => table.setFilter("tipo", value)} /></th>
            <th>Preço</th>
            <th><TableHeaderDateRangeFilter label="Cadastrado em" value={table.filters.criadoEm as { from: string; to: string }} onChange={(value) => table.setFilter("criadoEm", value)} /></th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {table.filteredItems.map((produto) => (
            <tr key={produto.produtoId}>
              <ExpandableTableCell summary={produto.nome ?? "Produto sem nome"} detail={<div><strong>{formatProdutoLabel(produto)}</strong><p>Código/SKU: {produto.sku ?? produto.sku ?? "Sem código"}</p><p>Unidade: {produto.unidade ?? "—"}</p><p>Tipo: {produto.tipo ?? "—"}</p><p>Preço de venda: {formatMoney(produto.precoVenda)}</p></div>} />
              <td>{produto.tipo ?? "—"}</td>
              <td>{formatMoney(produto.precoVenda)}</td>
              <td>{formatDate(produto.criadoEm)}</td>
              <td><div className="ck-register-row-actions"><Link className="ck-register-link" to={`/app/produtos/${produto.produtoId}`}>Ver</Link><Link className="ck-register-link" to={`/app/produtos/${produto.produtoId}/editar`}>Editar</Link></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
