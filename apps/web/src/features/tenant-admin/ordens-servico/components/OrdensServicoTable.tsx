// apps/web/src/features/tenant-admin/ordens-servico/components/OrdensServicoTable.tsx

import {
  TableHeaderDateRangeFilter,
  TableHeaderFilter,
  createDateRangeFilter,
  matchesDateRange,
  matchesFilter,
  useTableFilters,
} from "../../../../shared/table";
import type { Cliente } from "../../clientes/tipos";
import {
  formatClienteLabel,
  formatDateTime,
} from "../../../../shared/formatters";
import {
  DataTable,
  DataTableActions,
  DataTableLinkButton,
  DataTableStatus,
  type DataTableColumn,
} from "../../shared/data-table";
import type { OrdemServico, StatusOrdemServico } from "../tipos";
import { OrdemServicoDisplayTitle } from "./OrdemServicoDisplayTitle";

type Props = {
  itens: OrdemServico[];
  clientes?: Cliente[];
};

type OrdemServicoFilterKey = "ordem" | "cliente" | "status" | "data";

function statusTone(
  status: StatusOrdemServico,
): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "CONCLUIDA":
      return "success";
    case "CANCELADA":
      return "danger";
    case "EM_ANDAMENTO":
      return "default";
    case "AGUARDANDO":
    case "ABERTA":
    default:
      return "warning";
  }
}

function clienteInfo(
  ordem: OrdemServico,
  clientesPorId: Map<string, Cliente>,
): string {
  if (!ordem.clienteId) {
    return "Cliente não vinculado";
  }

  const cliente = clientesPorId.get(ordem.clienteId);

  return cliente ? formatClienteLabel(cliente) : "Cliente não carregado";
}

function ordemDetalhe(
  ordem: OrdemServico,
  cliente: string,
) {
  return (
    <details className="ck-expandable-native">
      <summary className="ck-expandable-native__summary">
        <span className="ck-expandable-native__summary-text">
          <OrdemServicoDisplayTitle ordemServico={ordem} />
        </span>
      </summary>

      <div className="ck-expandable-native__detail">
        <strong>
          <OrdemServicoDisplayTitle ordemServico={ordem} />
        </strong>

        <p>Título: {ordem.titulo ?? "Sem título"}</p>
        <p>Descrição: {ordem.descricao ?? "Sem descrição"}</p>
        <p>Cliente: {cliente}</p>
        <p>Status: {ordem.status}</p>
        <p>Aberta em: {formatDateTime(ordem.abertaEm ?? ordem.criadoEm)}</p>
      </div>
    </details>
  );
}

export function OrdensServicoTable({ itens, clientes = [] }: Props) {
  const clientesPorId = new Map(
    clientes.map((cliente) => [cliente.clienteId, cliente]),
  );

  const table = useTableFilters<OrdemServico, OrdemServicoFilterKey>(
    itens,
    {
      ordem: "",
      cliente: "",
      status: "",
      data: createDateRangeFilter(),
    },
    (ordem, filters) =>
      matchesFilter(
        `${ordem.titulo ?? ""} ${ordem.descricao ?? ""}`,
        filters.ordem,
      ) &&
      matchesFilter(clienteInfo(ordem, clientesPorId), filters.cliente) &&
      matchesFilter(ordem.status, filters.status) &&
      matchesDateRange(ordem.criadoEm ?? ordem.abertaEm, filters.data),
  );

  const columns: DataTableColumn<OrdemServico>[] = [
    {
      key: "ordem",
      header: (
        <TableHeaderFilter
          label="OS"
          value={table.filters.ordem as string}
          placeholder="Título ou descrição"
          onChange={(value) => table.setFilter("ordem", value)}
        />
      ),
      render: (ordem) => ordemDetalhe(ordem, clienteInfo(ordem, clientesPorId)),
    },
    {
      key: "cliente",
      header: (
        <TableHeaderFilter
          label="Cliente"
          value={table.filters.cliente as string}
          placeholder="Cliente"
          onChange={(value) => table.setFilter("cliente", value)}
        />
      ),
      render: (ordem) => clienteInfo(ordem, clientesPorId),
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
      render: (ordem) => (
        <DataTableStatus tone={statusTone(ordem.status)}>
          {ordem.status}
        </DataTableStatus>
      ),
    },
    {
      key: "data",
      header: (
        <TableHeaderDateRangeFilter
          label="Aberta em"
          value={table.filters.data as { from: string; to: string }}
          onChange={(value) => table.setFilter("data", value)}
        />
      ),
      render: (ordem) => formatDateTime(ordem.criadoEm ?? ordem.abertaEm),
    },
    {
      key: "acoes",
      header: "Ações",
      render: (ordem) => (
        <DataTableActions>
          <DataTableLinkButton
            to={`/app/ordens-servico/${ordem.ordemServicoId}`}
          >
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
      getRowKey={(ordem) => ordem.ordemServicoId}
      emptyMessage="Nenhuma ordem de serviço encontrada"
    />
  );
}
