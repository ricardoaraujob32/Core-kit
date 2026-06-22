// apps/web/src/features/tenant-admin/clientes/components/ClientesTable.tsx

import {
  TableHeaderFilter,
  matchesFilter,
  useTableFilters,
} from "../../../../shared/table";
import {
  formatClienteLabel,
  formatDateTime,
} from "../../../../shared/formatters";
import {
  DataTable,
  DataTableActions,
  DataTableLinkButton,
  type DataTableColumn,
} from "../../shared/data-table";
import type { Cliente } from "../tipos";

type Props = {
  itens: Cliente[];
};

type ClienteFilterKey = "cliente" | "documento" | "contato";

function clienteResumo(cliente: Cliente): string {
  return cliente.nome?.trim() || "Cliente sem nome";
}

function clienteDetalhe(cliente: Cliente) {
  return (
    <details className="ck-expandable-native">
      <summary className="ck-expandable-native__summary">
        <span className="ck-expandable-native__summary-text">
          {clienteResumo(cliente)}
        </span>
      </summary>

      <div className="ck-expandable-native__detail">
        <strong>{formatClienteLabel(cliente)}</strong>
        <p>Documento: {cliente.documento ?? "Não informado"}</p>
        <p>E-mail: {cliente.email ?? "—"}</p>
        <p>Telefone: {cliente.telefone ?? "—"}</p>
        <p>Criado em: {formatDateTime(cliente.criadoEm)}</p>
      </div>
    </details>
  );
}

export function ClientesTable({ itens }: Props) {
  const table = useTableFilters<Cliente, ClienteFilterKey>(
    itens,
    {
      cliente: "",
      documento: "",
      contato: "",
    },
    (cliente, filters) =>
      matchesFilter(cliente.nome, filters.cliente) &&
      matchesFilter(cliente.documento, filters.documento) &&
      matchesFilter(
        `${cliente.email ?? ""} ${cliente.telefone ?? ""}`,
        filters.contato,
      ),
  );

  const columns: DataTableColumn<Cliente>[] = [
    {
      key: "cliente",
      header: (
        <TableHeaderFilter
          label="Cliente"
          value={table.filters.cliente as string}
          placeholder="Nome"
          onChange={(value) => table.setFilter("cliente", value)}
        />
      ),
      render: clienteDetalhe,
    },
    {
      key: "documento",
      header: (
        <TableHeaderFilter
          label="Documento"
          value={table.filters.documento as string}
          placeholder="CPF/CNPJ"
          onChange={(value) => table.setFilter("documento", value)}
        />
      ),
      render: (cliente) => cliente.documento ?? "—",
    },
    {
      key: "contato",
      header: (
        <TableHeaderFilter
          label="Contato"
          value={table.filters.contato as string}
          placeholder="E-mail ou telefone"
          onChange={(value) => table.setFilter("contato", value)}
        />
      ),
      render: (cliente) => (
        <div>
          <div>{cliente.email ?? "—"}</div>
          <div>{cliente.telefone ?? "—"}</div>
        </div>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      render: (cliente) => (
        <DataTableActions>
          <DataTableLinkButton to={`/app/clientes/${cliente.clienteId}`}>
            Ver
          </DataTableLinkButton>

          <DataTableLinkButton to={`/app/clientes/${cliente.clienteId}/editar`}>
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
      getRowKey={(cliente) => cliente.clienteId}
      emptyMessage="Nenhum cliente encontrado"
    />
  );
}
