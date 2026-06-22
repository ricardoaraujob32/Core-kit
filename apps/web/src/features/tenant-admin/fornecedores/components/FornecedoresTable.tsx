// apps/web/src/features/tenant-admin/fornecedores/components/FornecedoresTable.tsx

import {
  TableHeaderFilter,
  matchesFilter,
  useTableFilters,
} from "../../../../shared/table";
import {
  formatDateTime,
  formatFornecedorLabel,
} from "../../../../shared/formatters";
import {
  DataTable,
  DataTableActions,
  DataTableLinkButton,
  type DataTableColumn,
} from "../../shared/data-table";
import type { Fornecedor } from "../tipos";

type Props = {
  itens: Fornecedor[];
};

type FornecedorFilterKey = "fornecedor" | "documento" | "contato";

function fornecedorResumo(fornecedor: Fornecedor): string {
  return fornecedor.nome?.trim() || "Fornecedor sem nome";
}

function fornecedorDetalhe(fornecedor: Fornecedor) {
  return (
    <details className="ck-expandable-native">
      <summary className="ck-expandable-native__summary">
        <span className="ck-expandable-native__summary-text">
          {fornecedorResumo(fornecedor)}
        </span>
      </summary>

      <div className="ck-expandable-native__detail">
        <strong>{formatFornecedorLabel(fornecedor)}</strong>
        <p>Documento: {fornecedor.documento ?? "Não informado"}</p>
        <p>E-mail: {fornecedor.email ?? "—"}</p>
        <p>Telefone: {fornecedor.telefone ?? "—"}</p>
        <p>Criado em: {formatDateTime(fornecedor.criadoEm)}</p>
      </div>
    </details>
  );
}

export function FornecedoresTable({ itens }: Props) {
  const table = useTableFilters<Fornecedor, FornecedorFilterKey>(
    itens,
    {
      fornecedor: "",
      documento: "",
      contato: "",
    },
    (fornecedor, filters) =>
      matchesFilter(fornecedor.nome, filters.fornecedor) &&
      matchesFilter(fornecedor.documento, filters.documento) &&
      matchesFilter(
        `${fornecedor.email ?? ""} ${fornecedor.telefone ?? ""}`,
        filters.contato,
      ),
  );

  const columns: DataTableColumn<Fornecedor>[] = [
    {
      key: "fornecedor",
      header: (
        <TableHeaderFilter
          label="Fornecedor"
          value={table.filters.fornecedor as string}
          placeholder="Nome"
          onChange={(value) => table.setFilter("fornecedor", value)}
        />
      ),
      render: fornecedorDetalhe,
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
      render: (fornecedor) => fornecedor.documento ?? "—",
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
      render: (fornecedor) => (
        <div>
          <div>{fornecedor.email ?? "—"}</div>
          <div>{fornecedor.telefone ?? "—"}</div>
        </div>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      render: (fornecedor) => (
        <DataTableActions>
          <DataTableLinkButton to={`/app/fornecedores/${fornecedor.fornecedorId}`}>
            Ver
          </DataTableLinkButton>

          <DataTableLinkButton
            to={`/app/fornecedores/${fornecedor.fornecedorId}/editar`}
          >
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
      getRowKey={(fornecedor) => fornecedor.fornecedorId}
      emptyMessage="Nenhum fornecedor encontrado"
    />
  );
}
