// apps/web/src/features/tenant-admin/financeiro/pages/FinanceiroPage.tsx

import { Link } from "react-router-dom";
import { ContasFinanceirasTable } from "../components/ContasFinanceirasTable";
import { FinanceiroResumoCards } from "../components/FinanceiroResumoCards";
import { useFinanceiro } from "../hooks/useFinanceiro";

export default function FinanceiroPage() {
  const { resumo, contasReceber, contasPagar, isLoading, erro, recarregar } = useFinanceiro();

  if (isLoading) {
    return (
      <main className="ck-page">
        <div className="ck-page-header">
          <div>
            <div className="ck-page-kicker">Financeiro</div>
            <h1 className="ck-page-title">Carregando financeiro...</h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="ck-page">
      <div className="ck-page-header">
        <div>
          <div className="ck-page-kicker">Financeiro</div>
          <h1 className="ck-page-title">Resumo financeiro</h1>
          <p className="ck-page-subtitle">
            Visão simples baseada em vendas e compras confirmadas, sem tabela financeira própria.
          </p>
        </div>

        <div className="ck-page-actions">
          <button className="ck-action-secondary" type="button" onClick={() => void recarregar()}>
            Atualizar
          </button>
          <Link className="ck-action-primary" to="/app/transacoes">
            Ver transações
          </Link>
        </div>
      </div>

      {erro ? <div className="ck-alert ck-alert-danger">{erro}</div> : null}

      <FinanceiroResumoCards resumo={resumo} />

      <div className="ck-grid-2">
        <ContasFinanceirasTable
          titulo="Contas a receber"
          itens={contasReceber}
          vazioTexto="Nenhuma conta a receber em aberto."
        />

        <ContasFinanceirasTable
          titulo="Contas a pagar"
          itens={contasPagar}
          vazioTexto="Nenhuma conta a pagar em aberto."
        />
      </div>
    </main>
  );
}
