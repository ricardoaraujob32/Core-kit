// apps/web/src/features/tenant-admin/produtos/components/ProdutosTable.tsx

import {
  TableHeaderFilter,
  TableHeaderNumberRangeFilter,
  createNumberRangeFilter,
  matchesFilter,
  matchesNumberRange,
  useTableFilters,
} from "../../../../shared/table";
import {
  formatMoney,
  formatProdutoLabel,
} from "../../../../shared/formatters";
import {
  DataTable,
  DataTableActions,
  DataTableLinkButton,
  DataTableStatus,
  type DataTableColumn,
} from "../../shared/data-table";
import type { Produto } from "../tipos";

type Props = {
  itens: Produto[];
};

type ProdutoFilterKey = "produto" | "tipo" | "status" | "preco";

function statusTone(ativo?: boolean): "success" | "warning" {
  return ativo === false ? "warning" : "success";
}

function statusLabel(ativo?: boolean): string {
  return ativo === false ? "Inativo" : "Ativo";
}

function produtoResumo(produto: Produto): string {
  return produto.nome?.trim() || "Produto sem nome";
}

function produtoDetalhe(produto: Produto) {
  return (
    <details className="ck-expandable-native">
      <summary className="ck-expandable-native__summary">
        <span className="ck-expandable-native__summary-text">
          {produtoResumo(produto)}
        </span>
      </summary>

      <div className="ck-expandable-native__detail">
        <strong>{formatProdutoLabel(produto)}</strong>
        <p>SKU: {produto.sku ?? "Sem SKU"}</p>
        <p>Unidade: {produto.unidade ?? "—"}</p>
        <p>Tipo: {produto.tipo ?? "—"}</p>
        <p>Preço de venda: {formatMoney(produto.precoVenda)}</p>
        <p>Custo de referência: {formatMoney(produto.custoReferencia)}</p>
        <p>Status: {statusLabel(produto.ativo)}</p>
      </div>
    </details>
  );
}

export function ProdutosTable({ itens }: Props) {
  const table = useTableFilters<Produto, ProdutoFilterKey>(
    itens,
    {
      produto: "",
      tipo: "",
      status: "",
      preco: createNumberRangeFilter(),
    },
    (produto, filters) =>
      matchesFilter(
        `${produto.nome ?? ""} ${produto.sku ?? ""} ${produto.unidade ?? ""}`,
        filters.produto,
      ) &&
      matchesFilter(produto.tipo, filters.tipo) &&
      matchesFilter(statusLabel(produto.ativo), filters.status) &&
      matchesNumberRange(produto.precoVenda, filters.preco),
  );

  const columns: DataTableColumn<Produto>[] = [
    {
      key: "produto",
      header: (
        <TableHeaderFilter
          label="Produto"
          value={table.filters.produto as string}
          placeholder="Nome ou SKU"
          onChange={(value) => table.setFilter("produto", value)}
        />
      ),
      render: produtoDetalhe,
    },
    {
      key: "tipo",
      header: (
        <TableHeaderFilter
          label="Tipo"
          value={table.filters.tipo as string}
          placeholder="Produto ou serviço"
          onChange={(value) => table.setFilter("tipo", value)}
        />
      ),
      render: (produto) => produto.tipo ?? "—",
    },
    {
      key: "preco",
      header: (
        <TableHeaderNumberRangeFilter
          label="Preço"
          value={table.filters.preco as { min: string; max: string }}
          minPlaceholder="Mín."
          maxPlaceholder="Máx."
          onChange={(value) => table.setFilter("preco", value)}
        />
      ),
      render: (produto) => formatMoney(produto.precoVenda),
    },
    {
      key: "status",
      header: (
        <TableHeaderFilter
          label="Status"
          value={table.filters.status as string}
          placeholder="Ativo/Inativo"
          onChange={(value) => table.setFilter("status", value)}
        />
      ),
      render: (produto) => (
        <DataTableStatus tone={statusTone(produto.ativo)}>
          {statusLabel(produto.ativo)}
        </DataTableStatus>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      render: (produto) => (
        <DataTableActions>
          <DataTableLinkButton to={`/app/produtos/${produto.produtoId}`}>
            Ver
          </DataTableLinkButton>

          <DataTableLinkButton to={`/app/produtos/${produto.produtoId}/editar`}>
            Editar
          </DataTableLinkButton>
        </DataTableActions>
      ),
    },
  ];

  return (
    <DataTable
      items={table.filteredItems}
      columns={columns}
      getRowKey={(produto) => produto.produtoId}
      emptyMessage="Nenhum produto encontrado"
    />
  );
}
