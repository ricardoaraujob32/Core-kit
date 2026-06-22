// apps/web/src/features/tenant-admin/transacoes/components/TransacoesTable.tsx

import {
  TableHeaderDateRangeFilter,
  TableHeaderFilter,
  createDateRangeFilter,
  matchesDateRange,
  matchesFilter,
  useTableFilters,
} from "../../../../shared/table";
import {
  formatDateTime,
  formatMoney,
  formatTransacaoLabel,
} from "../../../../shared/formatters";
import type { Cliente } from "../../clientes/tipos";
import type { Fornecedor } from "../../fornecedores/tipos";
import {
  DataTable,
  DataTableActions,
  DataTableLinkButton,
  DataTableStatus,
  type DataTableColumn,
} from "../../shared/data-table";
import type { Transacao } from "../tipos";

type Props = {
  itens: Transacao[];
  clientes?: Cliente[];
  fornecedores?: Fornecedor[];
};

type TransacaoFilterKey = "transacao" | "pessoa" | "status" | "data";

function statusTone(status?: string | null): "success" | "warning" | "danger" {
  switch (status) {
    case "CONFIRMADA":
    case "CONCLUIDA":
      return "success";
    case "CANCELADA":
      return "danger";
    default:
      return "warning";
  }
}

function pessoaNome(
  transacao: Transacao,
  clientesPorId: Map<string, Cliente>,
  fornecedoresPorId: Map<string, Fornecedor>,
): string {
  if (transacao.clienteId) {
    return clientesPorId.get(transacao.clienteId)?.nome ?? "Cliente não carregado";
  }

  if (transacao.fornecedorId) {
    return fornecedoresPorId.get(transacao.fornecedorId)?.nome ?? "Fornecedor não carregado";
  }

  return "Pessoa não informada";
}

function transacaoDetalhe(
  transacao: Transacao,
  pessoa: string,
) {
  return (
    <details className="ck-expandable-native">
      <summary className="ck-expandable-native__summary">
        <span className="ck-expandable-native__summary-text">
          {transacao.tipo ?? "Transação"} — {formatDateTime(transacao.criadoEm)}
        </span>
      </summary>

      <div className="ck-expandable-native__detail">
        <strong>{formatTransacaoLabel(transacao)}</strong>
        <p>Pessoa: {pessoa}</p>
        <p>Valor: {formatMoney(transacao.valorTotal)}</p>
        <p>Status: {transacao.status ?? "—"}</p>
        <p>Criada em: {formatDateTime(transacao.criadoEm)}</p>
      </div>
    </details>
  );
}

export function TransacoesTable({
  itens,
  clientes = [],
  fornecedores = [],
}: Props) {
  const clientesPorId = new Map(
    clientes.map((cliente) => [cliente.clienteId, cliente]),
  );

  const fornecedoresPorId = new Map(
    fornecedores.map((fornecedor) => [fornecedor.fornecedorId, fornecedor]),
  );

  const table = useTableFilters<Transacao, TransacaoFilterKey>(
    itens,
    {
      transacao: "",
      pessoa: "",
      status: "",
      data: createDateRangeFilter(),
    },
    (transacao, filters) =>
      matchesFilter(transacao.tipo, filters.transacao) &&
      matchesFilter(
        pessoaNome(transacao, clientesPorId, fornecedoresPorId),
        filters.pessoa,
      ) &&
      matchesFilter(transacao.status, filters.status) &&
      matchesDateRange(transacao.criadoEm, filters.data),
  );

  const columns: DataTableColumn<Transacao>[] = [
    {
      key: "transacao",
      header: (
        <TableHeaderFilter
          label="Transação"
          value={table.filters.transacao as string}
          placeholder="Tipo"
          onChange={(value) => table.setFilter("transacao", value)}
        />
      ),
      render: (transacao) =>
        transacaoDetalhe(
          transacao,
          pessoaNome(transacao, clientesPorId, fornecedoresPorId),
        ),
    },
    {
      key: "pessoa",
      header: (
        <TableHeaderFilter
          label="Pessoa"
          value={table.filters.pessoa as string}
          placeholder="Cliente ou fornecedor"
          onChange={(value) => table.setFilter("pessoa", value)}
        />
      ),
      render: (transacao) =>
        pessoaNome(transacao, clientesPorId, fornecedoresPorId),
    },
    {
      key: "valor",
      header: "Valor",
      render: (transacao) => formatMoney(transacao.valorTotal),
    },
    {
      key: "status",
      header: (
        <TableHeaderFilter
          label="Status"
          value={table.filters.status as string}
          placeholder="Status"
          onChange={(value) => table.setFilter("status", value)}
        />
      ),
      render: (transacao) => (
        <DataTableStatus tone={statusTone(transacao.status)}>
          {transacao.status ?? "—"}
        </DataTableStatus>
      ),
    },
    {
      key: "data",
      header: (
        <TableHeaderDateRangeFilter
          label="Data"
          value={table.filters.data as { from: string; to: string }}
          onChange={(value) => table.setFilter("data", value)}
        />
      ),
      render: (transacao) => formatDateTime(transacao.criadoEm),
    },
    {
      key: "acoes",
      header: "Ações",
      render: (transacao) => (
        <DataTableActions>
          <DataTableLinkButton to={`/app/transacoes/${transacao.transacaoId}`}>
            Ver
          </DataTableLinkButton>
        </DataTableActions>
      ),
    },
  ];

  return (
    <DataTable
      items={table.filteredItems}
      columns={columns}
      getRowKey={(transacao) => transacao.transacaoId}
      emptyMessage="Nenhuma transação encontrada"
    />
  );
}
