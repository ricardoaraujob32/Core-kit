// apps/web/src/features/tenant-admin/ordens-servico/pages/OrdensServicoListPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { PageSectionHeader } from "../../../../shared/layout/PageSectionHeader";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { OrdensServicoTable } from "../components/OrdensServicoTable";
import { useOrdensServico } from "../hooks/useOrdensServico";
import type { OrdemServico } from "../tipos";
import "../../cadastros/cadastros.css";
import "../../transacoes/pages/transacoes.css";

function contarStatus(itens: OrdemServico[], status: OrdemServico["status"]) {
  return itens.filter((item) => item.status === status).length;
}

export default function OrdensServicoListPage() {
  const { itens, loading, erro, recarregar } = useOrdensServico();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [erroClientes, setErroClientes] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarClientes() {
      setErroClientes(null);

      try {
        const response = await clientesApi.listar();

        if (ativo) setClientes(response.itens);
      } catch (error) {
        if (ativo) setErroClientes(mapError(error).message);
      }
    }

    void carregarClientes();

    return () => {
      ativo = false;
    };
  }, []);

  const resumo = useMemo(
    () => ({
      abertas: contarStatus(itens, "ABERTA"),
      andamento: contarStatus(itens, "EM_ANDAMENTO"),
      aguardando: contarStatus(itens, "AGUARDANDO"),
      concluidas: contarStatus(itens, "CONCLUIDA"),
    }),
    [itens],
  );

  return (
    <main className="ck-register-page">
      <PageSectionHeader
        kicker="Operação"
        title="Ordens de Serviço"
        description="Controle serviços prestados, acompanhe status e gere venda quando a OS for concluída."
        actions={
          <>
            <button
              className="ck-register-action-secondary"
              type="button"
              onClick={() => void recarregar()}
            >
              Atualizar
            </button>

            <Link
              className="ck-register-action-primary"
              to="/app/ordens-servico/nova"
            >
              Nova OS
            </Link>
          </>
        }
      />

      <section className="ck-register-stats">
        <article className="ck-register-stat">
          <div className="ck-register-stat-row">
            <div>
              <div className="ck-register-stat-label">Abertas</div>
              <div className="ck-register-stat-value">{resumo.abertas}</div>
              <div className="ck-register-stat-hint">Aguardando início</div>
            </div>
            <div className="ck-register-stat-icon">📝</div>
          </div>
        </article>

        <article className="ck-register-stat">
          <div className="ck-register-stat-row">
            <div>
              <div className="ck-register-stat-label">Em andamento</div>
              <div className="ck-register-stat-value">{resumo.andamento}</div>
              <div className="ck-register-stat-hint">Execução em curso</div>
            </div>
            <div className="ck-register-stat-icon">🔧</div>
          </div>
        </article>

        <article className="ck-register-stat">
          <div className="ck-register-stat-row">
            <div>
              <div className="ck-register-stat-label">Concluídas</div>
              <div className="ck-register-stat-value">{resumo.concluidas}</div>
              <div className="ck-register-stat-hint">
                Prontas para venda/finalização
              </div>
            </div>
            <div className="ck-register-stat-icon">✅</div>
          </div>
        </article>
      </section>

      {erro ? <div className="ck-register-alert">{erro}</div> : null}

      {erroClientes ? (
        <div className="ck-alert ck-alert-warning">
          Não foi possível carregar nomes dos clientes. Detalhe: {erroClientes}
        </div>
      ) : null}

      {loading ? (
        <div className="ck-register-filter">Carregando ordens de serviço...</div>
      ) : (
        <OrdensServicoTable itens={itens} clientes={clientes} />
      )}
    </main>
  );
}
