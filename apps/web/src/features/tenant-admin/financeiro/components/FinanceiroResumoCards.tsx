// apps/web/src/features/tenant-admin/financeiro/components/FinanceiroResumoCards.tsx

import type { ResumoFinanceiro } from "../tipos";

function formatarMoeda(valor?: number | null): string {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type Props = {
  resumo: ResumoFinanceiro | null;
};

export function FinanceiroResumoCards({ resumo }: Props) {
  const totalVencido = Number(resumo?.totalVencidoReceber ?? 0) + Number(resumo?.totalVencidoPagar ?? 0);
  const quantidadeVencidos = Number(resumo?.quantidadeVencidosReceber ?? 0) + Number(resumo?.quantidadeVencidosPagar ?? 0);

  return (
    <div className="ck-stats-grid">
      <article className="ck-stat-card">
        <div className="ck-stat-label">A receber</div>
        <div className="ck-stat-value">{formatarMoeda(resumo?.totalAReceber)}</div>
        <div className="ck-stat-hint">Vendas confirmadas ainda não concluídas</div>
      </article>

      <article className="ck-stat-card">
        <div className="ck-stat-label">A pagar</div>
        <div className="ck-stat-value">{formatarMoeda(resumo?.totalAPagar)}</div>
        <div className="ck-stat-hint">Compras confirmadas ainda não concluídas</div>
      </article>

      <article className="ck-stat-card">
        <div className="ck-stat-label">Saldo previsto</div>
        <div className="ck-stat-value">{formatarMoeda(resumo?.saldoPrevisto)}</div>
        <div className="ck-stat-hint">A receber menos a pagar</div>
      </article>

      <article className="ck-stat-card">
        <div className="ck-stat-label">Vencidos</div>
        <div className="ck-stat-value">{formatarMoeda(totalVencido)}</div>
        <div className="ck-stat-hint">{quantidadeVencidos} conta(s) vencida(s)</div>
      </article>
    </div>
  );
}
