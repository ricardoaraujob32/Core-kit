// apps/web/src/features/tenant-admin/transacoes/components/TransacoesTable.tsx

import { Link } from "react-router-dom";
import type { Cliente } from "../../clientes/tipos";
import type { Fornecedor } from "../../fornecedores/tipos";
import type { Transacao } from "../tipos";

type Props = {
  itens: Transacao[];
  clientes?: Cliente[];
  fornecedores?: Fornecedor[];
};

function formatarMoeda(valor?: number | null): string {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR");
}

function codigoCurto(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function statusClass(status: string): string {
  const normalized = status.trim().toUpperCase();

  if (normalized === "CONCLUIDA") return "ck-status ck-status-success";
  if (normalized === "CANCELADA") return "ck-status ck-status-danger";

  if (normalized === "ABERTA" || normalized === "RASCUNHO") {
    return "ck-status ck-status-warning";
  }

  return "ck-status";
}

function pessoaInfo(
  transacao: Transacao,
  clientesPorId: Map<string, Cliente>,
  fornecedoresPorId: Map<string, Fornecedor>,
): { nome: string; detalhe: string } {
  if (transacao.tipo === "COMPRA") {
    if (!transacao.fornecedorId) {
      return { nome: "Sem fornecedor", detalhe: "Compra avulsa" };
    }

    const fornecedor = fornecedoresPorId.get(transacao.fornecedorId);

    if (!fornecedor) {
      return {
        nome: `Fornecedor #${codigoCurto(transacao.fornecedorId)}`,
        detalhe: "Cadastro não carregado",
      };
    }

    return {
      nome: fornecedor.nome,
      detalhe: fornecedor.documento ?? fornecedor.email ?? "Fornecedor",
    };
  }

  if (!transacao.clienteId) {
    return { nome: "Sem cliente", detalhe: "Venda balcão" };
  }

  const cliente = clientesPorId.get(transacao.clienteId);

  if (!cliente) {
    return {
      nome: `Cliente #${codigoCurto(transacao.clienteId)}`,
      detalhe: "Cadastro não carregado",
    };
  }

  return {
    nome: cliente.nome,
    detalhe: cliente.documento ?? cliente.email ?? "Cliente",
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

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <div className="ck-table-panel">
          <table className="ck-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Cliente/fornecedor</th>
                <th>Status</th>
                <th>Total</th>
                <th>Criada em</th>
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
                      <span className="ck-code-pill">
                        #{codigoCurto(transacao.transacaoId)}
                      </span>
                    </td>
                    <td>{transacao.tipo}</td>
                    <td>
                      <div className="ck-person-main">{pessoa.nome}</div>
                      <div className="ck-person-sub">{pessoa.detalhe}</div>
                    </td>
                    <td>
                      <span className={statusClass(transacao.status)}>
                        {transacao.status}
                      </span>
                    </td>
                    <td>
                      <strong>{formatarMoeda(transacao.valorTotal)}</strong>
                    </td>
                    <td>{formatarData(transacao.criadoEm)}</td>
                    <td>
                      <Link
                        className="ck-row-link"
                        to={`/app/transacoes/${transacao.transacaoId}`}
                      >
                        Detalhes
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
                    {transacao.tipo} #{codigoCurto(transacao.transacaoId)}
                  </div>
                  <div className="ck-transaction-desc">{pessoa.nome}</div>
                </div>

                <span className={statusClass(transacao.status)}>
                  {transacao.status}
                </span>
              </div>

              <div className="ck-card-grid">
                <div>
                  <div className="ck-card-label">Total</div>
                  <div className="ck-card-value">
                    {formatarMoeda(transacao.valorTotal)}
                  </div>
                </div>

                <div>
                  <div className="ck-card-label">Criada em</div>
                  <div className="ck-card-value">
                    {formatarData(transacao.criadoEm)}
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
