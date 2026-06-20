// apps/web/src/features/tenant-admin/transacoes/components/TransacoesTable.tsx

import { Link } from "react-router-dom";
import { ExpandableTableCell, TableHeaderDateRangeFilter, TableHeaderFilter, createDateRangeFilter, matchesDateRange, matchesFilter, useTableFilters } 
from "../../../../shared/table";
import { formatDateTime, formatMoney, formatTransacaoLabel } from "../../../../shared/formatters";
import type { Cliente } from "../../clientes/tipos";
import type { Fornecedor } from "../../fornecedores/tipos";
import type { Transacao } from "../tipos";

type Props = {
  itens: Transacao[];
  clientes?: Cliente[];
  fornecedores?: Fornecedor[];
};

type TransacaoFilterKey = "transacao" | "pessoa" | "status" | "data";

function statusClass(status?: string | null): string {
  switch (status) {
    case "CONFIRMADA":
    case "CONCLUIDA":
      return "ck-status ck-status-success";
    case "CANCELADA":
      return "ck-status ck-status-danger";
    default:
      return "ck-status ck-status-warning";
  }
}

function pessoaNome(transacao: Transacao, clientesPorId: Map<string, Cliente>, fornecedoresPorId: Map<string, Fornecedor>): string {
  if (transacao.clienteId) {
    return clientesPorId.get(transacao.clienteId)?.nome ?? "Cliente não carregado";
  }

  if (transacao.fornecedorId) {
    return fornecedoresPorId.get(transacao.fornecedorId)?.nome ?? "Fornecedor não carregado";
  }

  return "Pessoa não informada";
}

export function TransacoesTable({ itens, clientes = [], fornecedores = [] }: Props) {
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

  if (itens.length === 0) {
    return (
      <div className="ck-register-empty">
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <div className="ck-register-table-panel">
      <table className="ck-register-table">
        <thead>
          <tr>
            <th>
              <TableHeaderFilter
                label="Transação"
                value={table.filters.transacao as string}
                placeholder="Tipo"
                onChange={(value) => table.setFilter("transacao", value)}
              />
            </th>

            <th>
              <TableHeaderFilter
                label="Pessoa"
                value={table.filters.pessoa as string}
                placeholder="Cliente ou fornecedor"
                onChange={(value) => table.setFilter("pessoa", value)}
              />
            </th>

            <th>Valor</th>

            <th>
              <TableHeaderFilter
                label="Status"
                value={table.filters.status as string}
                placeholder="Status"
                onChange={(value) => table.setFilter("status", value)}
              />
            </th>

            <th>
              <TableHeaderDateRangeFilter
                label="Data"
                value={table.filters.data as { from: string; to: string }}
                onChange={(value) => table.setFilter("data", value)}
              />
            </th>

            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {table.filteredItems.map((transacao) => {
            const pessoa = pessoaNome(
              transacao,
              clientesPorId,
              fornecedoresPorId,
            );

            return (
              <tr key={transacao.transacaoId}>
                <ExpandableTableCell
                  summary={`${transacao.tipo ?? "Transação"} — ${formatDateTime(
                    transacao.criadoEm,
                  )}`}
                  detail={
                    <div>
                      <strong>{formatTransacaoLabel(transacao)}</strong>
                      <p>Pessoa: {pessoa}</p>
                      <p>Valor: {formatMoney(transacao.valorTotal)}</p>
                      <p>Status: {transacao.status ?? "—"}</p>
                    </div>
                  }
                />

                <td>{pessoa}</td>
                <td>{formatMoney(transacao.valorTotal)}</td>

                <td>
                  <span className={statusClass(transacao.status)}>
                    {transacao.status ?? "—"}
                  </span>
                </td>

                <td>{formatDateTime(transacao.criadoEm)}</td>

                <td>
                  <div className="ck-register-row-actions">
                    <Link
                      className="ck-register-link"
                      to={`/app/transacoes/${transacao.transacaoId}`}
                    >
                      Ver
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
