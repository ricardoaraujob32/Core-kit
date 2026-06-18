// apps/web/src/features/tenant-admin/ordens-servico/components/OrdensServicoTable.tsx

import { Link } from "react-router-dom";
import type { Cliente } from "../../clientes/tipos";
import {
  formatClienteLabel,
  formatDateTime,
  shortCode,
} from "../../../../shared/formatters";
import type { OrdemServico, StatusOrdemServico } from "../tipos";
import { OrdemServicoDisplayTitle } from "./OrdemServicoDisplayTitle";

type Props = {
  itens: OrdemServico[];
  clientes?: Cliente[];
};

function statusClass(status: StatusOrdemServico): string {
  switch (status) {
    case "CONCLUIDA":
      return "ck-status ck-status-success";
    case "CANCELADA":
      return "ck-status ck-status-danger";
    case "AGUARDANDO":
      return "ck-status ck-status-warning";
    case "EM_ANDAMENTO":
      return "ck-status";
    case "ABERTA":
    default:
      return "ck-status ck-status-warning";
  }
}

function clienteInfo(
  ordem: OrdemServico,
  clientesPorId: Map<string, Cliente>,
): { principal: string; secundario: string } {
  if (!ordem.clienteId) {
    return {
      principal: "Cliente não vinculado",
      secundario: "OS sem cliente",
    };
  }

  const cliente = clientesPorId.get(ordem.clienteId);

  if (!cliente) {
    return {
      principal: "Cliente não carregado",
      secundario: `Ref. ${shortCode(ordem.clienteId)}`,
    };
  }

  return {
    principal: formatClienteLabel(cliente),
    secundario: cliente.telefone ?? cliente.email ?? "Cliente",
  };
}

export function OrdensServicoTable({ itens, clientes = [] }: Props) {
  const clientesPorId = new Map(
    clientes.map((cliente) => [cliente.clienteId, cliente]),
  );

  if (itens.length === 0) {
    return (
      <div className="ck-register-empty">
        <div className="ck-register-empty-title">
          Nenhuma ordem de serviço encontrada
        </div>
        <p className="ck-register-empty-desc">
          Crie uma OS para acompanhar atendimento, execução e geração de venda.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <div className="ck-table-panel">
          <table className="ck-table">
            <thead>
              <tr>
                <th>Ordem de serviço</th>
                <th>Cliente</th>
                <th>Título</th>
                <th>Status</th>
                <th>Aberta em</th>
                <th>Referência</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {itens.map((ordem) => {
                const cliente = clienteInfo(ordem, clientesPorId);

                return (
                  <tr key={ordem.ordemServicoId}>
                    <td>
                      <OrdemServicoDisplayTitle ordemServico={ordem} />
                      <div className="ck-register-sub">
                        Identificada por data e horário
                      </div>
                    </td>

                    <td>
                      <div className="ck-register-main">{cliente.principal}</div>
                      <div className="ck-register-sub">{cliente.secundario}</div>
                    </td>

                    <td>
                      <div className="ck-register-main">{ordem.titulo}</div>
                      <div className="ck-register-sub">
                        {ordem.descricao ?? "Sem descrição"}
                      </div>
                    </td>

                    <td>
                      <span className={statusClass(ordem.status)}>
                        {ordem.status}
                      </span>
                    </td>

                    <td>{formatDateTime(ordem.abertaEm ?? ordem.criadoEm)}</td>

                    <td>
                      <span className="ck-code-pill">
                        Ref. {shortCode(ordem.ordemServicoId)}
                      </span>
                    </td>

                    <td>
                      <Link
                        className="ck-row-link"
                        to={`/app/ordens-servico/${ordem.ordemServicoId}`}
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ck-mobile-list md:hidden">
        {itens.map((ordem) => {
          const cliente = clienteInfo(ordem, clientesPorId);

          return (
            <article className="ck-transaction-card" key={ordem.ordemServicoId}>
              <div className="ck-transaction-card-top">
                <div>
                  <div className="ck-transaction-title">
                    <OrdemServicoDisplayTitle ordemServico={ordem} />
                  </div>

                  <div className="ck-transaction-desc">{cliente.principal}</div>
                </div>

                <span className={statusClass(ordem.status)}>
                  {ordem.status}
                </span>
              </div>

              <div className="ck-card-grid">
                <div>
                  <div className="ck-card-label">Título</div>
                  <div className="ck-card-value">{ordem.titulo}</div>
                </div>

                <div>
                  <div className="ck-card-label">Referência</div>
                  <div className="ck-card-value">
                    {shortCode(ordem.ordemServicoId)}
                  </div>
                </div>
              </div>

              <Link
                className="ck-action-secondary"
                to={`/app/ordens-servico/${ordem.ordemServicoId}`}
              >
                Ver detalhes
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
