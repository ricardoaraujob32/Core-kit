// apps/web/src/features/tenant-admin/financeiro/components/ContasFinanceirasTable.tsx

import { Link } from "react-router-dom";
import {
  formatDate,
  formatMoney,
  shortCode,
} from "../../../../shared/formatters";
import type { ContaFinanceira } from "../tipos";

type Props = {
  titulo: string;
  itens: ContaFinanceira[];
  vazioTexto: string;
};

function statusClass(status: string): string {
  return status === "LIQUIDADO"
    ? "ck-status ck-status-success"
    : "ck-status ck-status-warning";
}

function descricaoPadrao(conta: ContaFinanceira): string {
  return conta.descricao || (conta.tipo === "RECEBER" ? "Conta a receber" : "Conta a pagar");
}

export function ContasFinanceirasTable({ titulo, itens, vazioTexto }: Props) {
  return (
    <section className="ck-section">
      <div className="ck-section-header">
        <div>
          <h2 className="ck-section-title">{titulo}</h2>
          <p className="ck-section-subtitle">
            Visão derivada das transações confirmadas.
          </p>
        </div>
      </div>

      {itens.length === 0 ? (
        <div className="ck-empty-state">{vazioTexto}</div>
      ) : (
        <div className="ck-table-panel">
          <table className="ck-table">
            <thead>
              <tr>
                <th>Origem</th>
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
                    <div className="ck-register-main">
                      {conta.tipo === "RECEBER" ? "Venda" : "Compra"}
                    </div>
                    <div className="ck-register-sub">
                      Ref. {shortCode(conta.transacaoId)}
                    </div>
                  </td>

                  <td>{descricaoPadrao(conta)}</td>

                  <td>
                    <span className={statusClass(conta.status)}>
                      {conta.status}
                    </span>
                  </td>

                  <td>{formatDate(conta.vencimentoEm)}</td>

                  <td>
                    <strong>{formatMoney(conta.valor)}</strong>
                  </td>

                  <td>
                    <Link
                      className="ck-row-link"
                      to={`/app/transacoes/${conta.transacaoId}`}
                    >
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
