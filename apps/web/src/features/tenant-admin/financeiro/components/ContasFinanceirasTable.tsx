// apps/web/src/features/tenant-admin/financeiro/components/ContasFinanceirasTable.tsx

import { Link } from "react-router-dom";
import type { ContaFinanceira } from "../tipos";

type Props = {
  titulo: string;
  itens: ContaFinanceira[];
  vazioTexto: string;
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
  return status === "LIQUIDADO" ? "ck-status ck-status-success" : "ck-status ck-status-warning";
}

export function ContasFinanceirasTable({ titulo, itens, vazioTexto }: Props) {
  return (
    <section className="ck-section">
      <div className="ck-section-header">
        <div>
          <h2 className="ck-section-title">{titulo}</h2>
          <p className="ck-section-subtitle">Visão derivada das transações confirmadas.</p>
        </div>
      </div>

      {itens.length === 0 ? (
        <div className="ck-empty-state">{vazioTexto}</div>
      ) : (
        <div className="ck-table-panel">
          <table className="ck-table">
            <thead>
              <tr>
                <th>Transação</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((conta) => (
                <tr key={conta.transacaoId}>
                  <td>
                    <span className="ck-code-pill">#{codigoCurto(conta.transacaoId)}</span>
                  </td>
                  <td>{conta.descricao || (conta.tipo === "RECEBER" ? "Conta a receber" : "Conta a pagar")}</td>
                  <td>
                    <span className={statusClass(conta.status)}>{conta.status}</span>
                  </td>
                  <td>{formatarData(conta.vencimentoEm)}</td>
                  <td>
                    <strong>{formatarMoeda(conta.valor)}</strong>
                  </td>
                  <td>
                    <Link className="ck-row-link" to={`/app/transacoes/${conta.transacaoId}`}>
                      Ver transação
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
