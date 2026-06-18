// apps/web/src/features/tenant-admin/transacoes/components/TransacoesTable.tsx

import { Link } from "react-router-dom";
import type { Cliente } from "../../clientes/tipos";
import type { Fornecedor } from "../../fornecedores/tipos";
import {
  formatClienteLabel,
  formatFornecedorLabel,
  formatMoney,
  formatTransacaoTitulo,
  shortCode,
} from "../../../../shared/formatters";
import type { Transacao } from "../tipos";

type Props = {
  itens: Transacao[];
  clientes?: Cliente[];
  fornecedores?: Fornecedor[];
};

function statusClass(status: string): string {
  const normalized = status.trim().toUpperCase();

  if (normalized === "CONCLUIDA") return "ck-status ck-status-success";
  if (normalized === "CANCELADA") return "ck-status ck-status-danger";

  if (
    normalized === "ABERTA" ||
    normalized === "EM_PROCESSAMENTO" ||
    normalized === "AGUARDANDO_PAGAMENTO" ||
    normalized === "ENVIADA"
  ) {
    return "ck-status ck-status-warning";
  }

  return "ck-status";
}

function pessoaInfo(
  transacao: Transacao,
  clientesPorId: Map<string, Cliente>,
  fornecedoresPorId: Map<string, Fornecedor>,
): { principal: string; secundario: string } {
  if (transacao.tipo === "COMPRA") {
    if (!transacao.fornecedorId) {
      return {
        principal: "Compra sem fornecedor",
        secundario: "Fornecedor não vinculado",
      };
    }

    const fornecedor = fornecedoresPorId.get(transacao.fornecedorId);

    if (!fornecedor) {
      return {
        principal: "Fornecedor não carregado",
        secundario: `Ref. ${shortCode(transacao.fornecedorId)}`,
      };
    }

    return {
      principal: formatFornecedorLabel(fornecedor),
      secundario: fornecedor.telefone ?? fornecedor.email ?? "Fornecedor",
    };
  }

  if (!transacao.clienteId) {
    return {
      principal: "Venda balcão",
      secundario: "Cliente não vinculado",
    };
  }

  const cliente = clientesPorId.get(transacao.clienteId);

  if (!cliente) {
    return {
      principal: "Cliente não carregado",
      secundario: `Ref. ${shortCode(transacao.clienteId)}`,
    };
  }

  return {
    principal: formatClienteLabel(cliente),
    secundario: cliente.telefone ?? cliente.email ?? "Cliente",
  };
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

  if (itens.length === 0) {
    return (
      <div className="ck-register-empty">
        <div className="ck-register-empty-title">Nenhuma transação encontrada</div>
        <p className="ck-register-empty-desc">
          Crie uma venda ou compra para começar a movimentar o sistema.
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
                <th>Transação</th>
                <th>Cliente/fornecedor</th>
                <th>Status</th>
                <th>Total</th>
                <th>Itens</th>
                <th>Referência</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {itens.map((transacao) => {
                const pessoa = pessoaInfo(
                  transacao,
                  clientesPorId,
                  fornecedoresPorId,
                );

                return (
                  <tr key={transacao.transacaoId}>
                    <td>
                      <div className="ck-register-main">
                        {formatTransacaoTitulo({
                          tipo: transacao.tipo,
                          criadoEm: transacao.criadoEm,
                          fallbackId: transacao.transacaoId,
                        })}
                      </div>
                      <div className="ck-register-sub">
                        Identificada por data e horário
                      </div>
                    </td>

                    <td>
                      <div className="ck-register-main">{pessoa.principal}</div>
                      <div className="ck-register-sub">{pessoa.secundario}</div>
                    </td>

                    <td>
                      <span className={statusClass(transacao.status)}>
                        {transacao.status}
                      </span>
                    </td>

                    <td>
                      <strong>{formatMoney(transacao.valorTotal)}</strong>
                    </td>

                    <td>{transacao.itens?.length ?? 0}</td>

                    <td>
                      <span className="ck-code-pill">
                        Ref. {shortCode(transacao.transacaoId)}
                      </span>
                    </td>

                    <td>
                      <Link
                        className="ck-row-link"
                        to={`/app/transacoes/${transacao.transacaoId}`}
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
        {itens.map((transacao) => {
          const pessoa = pessoaInfo(transacao, clientesPorId, fornecedoresPorId);

          return (
            <article className="ck-transaction-card" key={transacao.transacaoId}>
              <div className="ck-transaction-card-top">
                <div>
                  <div className="ck-transaction-title">
                    {formatTransacaoTitulo({
                      tipo: transacao.tipo,
                      criadoEm: transacao.criadoEm,
                      fallbackId: transacao.transacaoId,
                    })}
                  </div>

                  <div className="ck-transaction-desc">{pessoa.principal}</div>
                </div>

                <span className={statusClass(transacao.status)}>
                  {transacao.status}
                </span>
              </div>

              <div className="ck-card-grid">
                <div>
                  <div className="ck-card-label">Total</div>
                  <div className="ck-card-value">
                    {formatMoney(transacao.valorTotal)}
                  </div>
                </div>

                <div>
                  <div className="ck-card-label">Referência</div>
                  <div className="ck-card-value">
                    {shortCode(transacao.transacaoId)}
                  </div>
                </div>
              </div>

              <Link
                className="ck-action-secondary"
                to={`/app/transacoes/${transacao.transacaoId}`}
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
