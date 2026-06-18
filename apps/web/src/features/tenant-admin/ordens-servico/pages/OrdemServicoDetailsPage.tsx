
// apps/web/src/features/tenant-admin/ordens-servico/pages/OrdemServicoDetailsPage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import {
  formatClienteLabel,
  formatDateTime,
  formatMoney,
} from "../../../../shared/formatters";
import { PageSectionHeader } from "../../../../shared/layout/PageSectionHeader";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { ordensServicoApi } from "../api/ordensServicoApi";
import type { OrdemServico } from "../tipos";
import { toOrdemServicoViewModel } from "../ordemServico.viewModel";
import "../../cadastros/cadastros.css";
import "../../transacoes/pages/transacoes.css";

type AcaoOs = "iniciar" | "aguardar" | "concluir" | "cancelar";

function statusClass(status: OrdemServico["status"]): string {
  if (status === "CONCLUIDA") return "ck-status ck-status-success";
  if (status === "CANCELADA") return "ck-status ck-status-danger";
  if (status === "AGUARDANDO" || status === "ABERTA") {
    return "ck-status ck-status-warning";
  }

  return "ck-status";
}

export default function OrdemServicoDetailsPage() {
  const { ordemServicoId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<OrdemServico | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [valorTotal, setValorTotal] = useState("0");
  const [isRunning, setIsRunning] = useState<AcaoOs | "gerar-venda" | null>(
    null,
  );

  async function carregar() {
    if (!ordemServicoId) return;

    setErro(null);

    try {
      const response = await ordensServicoApi.obter(ordemServicoId);
      setItem(response.item);

      if (response.item.clienteId) {
        const clienteResponse = await clientesApi.obter(response.item.clienteId);
        setCliente(clienteResponse.item);
      } else {
        setCliente(null);
      }
    } catch (error) {
      setErro(mapError(error).message);
    }
  }

  useEffect(() => {
    void carregar();
  }, [ordemServicoId]);

  async function executar(acao: AcaoOs) {
    if (!ordemServicoId) return;

    setErroAcao(null);
    setIsRunning(acao);

    try {
      const response = await ordensServicoApi[acao](ordemServicoId);
      setItem(response.item);
    } catch (error) {
      setErroAcao(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  async function gerarVenda() {
    if (!ordemServicoId) return;

    setErroAcao(null);
    setIsRunning("gerar-venda");

    try {
      const response = await ordensServicoApi.gerarVenda(ordemServicoId, {
        valorTotal: Number(valorTotal),
        vencimentoEm: new Date().toISOString(),
      });

      setItem(response.item);
      navigate(`/app/transacoes/${response.transacaoId}`);
    } catch (error) {
      setErroAcao(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  if (erro) {
    return <main className="ck-register-alert">{erro}</main>;
  }

  if (!item) {
    return (
      <main className="ck-register-filter">Carregando ordem de serviço...</main>
    );
  }

  const podeIniciar = item.status === "ABERTA" || item.status === "AGUARDANDO";
  const podeAguardar = item.status === "ABERTA" || item.status === "EM_ANDAMENTO";
  const podeFinalizar = item.status !== "CONCLUIDA" && item.status !== "CANCELADA";
  const podeGerarVenda = item.status === "CONCLUIDA" && !item.transacaoId;
  const vm = toOrdemServicoViewModel({
    ...item,
    clienteNome: cliente ? formatClienteLabel(cliente) : undefined,
  });

  return (
    <main className="ck-register-page">
      <PageSectionHeader
        kicker="Ordem de serviço"
        title={vm.titulo}
        description={[vm.subtitulo, item.titulo].filter(Boolean).join(" — ")}
        actions={
          <>
            <Link
              className="ck-register-action-secondary"
              to="/app/ordens-servico"
            >
              Voltar
            </Link>

            {item.transacaoId ? (
              <Link
                className="ck-register-action-primary"
                to={`/app/transacoes/${item.transacaoId}`}
              >
                Abrir venda gerada
              </Link>
            ) : null}
          </>
        }
      />

      {erroAcao ? <div className="ck-register-alert">{erroAcao}</div> : null}

      <section className="ck-register-form-card">
        <div className="ck-register-form-header">
          <div className="ck-register-form-title">Resumo da OS</div>
          <p className="ck-register-form-desc">
            Identificação principal por data e horário; referência técnica curta
            somente como apoio.
          </p>
        </div>

        <div className="ck-register-form-body">
          <div className="ck-selected-grid">
            <div>
              <div className="ck-selected-label">Status</div>
              <div className="ck-selected-value">
                <span className={statusClass(item.status)}>{item.status}</span>
              </div>
            </div>

            <div>
              <div className="ck-selected-label">Cliente</div>
              <div className="ck-selected-value">
                {cliente ? formatClienteLabel(cliente) : "Cliente não vinculado"}
              </div>
            </div>

            <div>
              <div className="ck-selected-label">Aberta em</div>
              <div className="ck-selected-value">
                {formatDateTime(item.abertaEm ?? item.criadoEm)}
              </div>
            </div>

            <div>
              <div className="ck-selected-label">Atualizada em</div>
              <div className="ck-selected-value">
                {formatDateTime(item.atualizadoEm)}
              </div>
            </div>

            <div>
              <div className="ck-selected-label">Venda gerada</div>
              <div className="ck-selected-value">
                {item.transacaoId ? "Sim" : "—"}
              </div>
            </div>
          </div>

          <div>
            <div className="ck-selected-label">Descrição</div>
            <div className="ck-selected-value">
              {item.descricao ?? "Sem descrição."}
            </div>
          </div>
        </div>
      </section>

      <section className="ck-register-form-card">
        <div className="ck-register-form-header">
          <div className="ck-register-form-title">Ações da OS</div>
          <p className="ck-register-form-desc">
            Atualize o ciclo de vida da ordem de serviço.
          </p>
        </div>

        <div className="ck-register-form-body">
          <div className="flex flex-wrap gap-2">
            <button
              className="ck-register-action-secondary"
              type="button"
              disabled={!podeIniciar || isRunning !== null}
              onClick={() => void executar("iniciar")}
            >
              Iniciar
            </button>

            <button
              className="ck-register-action-secondary"
              type="button"
              disabled={!podeAguardar || isRunning !== null}
              onClick={() => void executar("aguardar")}
            >
              Aguardar
            </button>

            <button
              className="ck-register-action-primary"
              type="button"
              disabled={!podeFinalizar || isRunning !== null}
              onClick={() => void executar("concluir")}
            >
              Concluir
            </button>

            <button
              className="ck-register-action-secondary"
              type="button"
              disabled={!podeFinalizar || isRunning !== null}
              onClick={() => void executar("cancelar")}
            >
              Cancelar
            </button>
          </div>
        </div>
      </section>

      <section className="ck-register-form-card">
        <div className="ck-register-form-header">
          <div className="ck-register-form-title">Gerar venda</div>
          <p className="ck-register-form-desc">
            Depois de concluir a OS, gere uma venda vinculada ao serviço.
          </p>
        </div>

        <div className="ck-register-form-body">
          {item.transacaoId ? (
            <Link
              className="ck-register-action-primary"
              to={`/app/transacoes/${item.transacaoId}`}
            >
              Abrir venda gerada
            </Link>
          ) : (
            <>
              <label className="ck-register-field">
                <span>Valor total</span>
                <input
                  className="ck-register-input"
                  value={valorTotal}
                  onChange={(event) => setValorTotal(event.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={formatMoney(0)}
                />
              </label>

              <div>
                <button
                  className="ck-register-action-primary"
                  type="button"
                  disabled={!podeGerarVenda || isRunning !== null}
                  onClick={() => void gerarVenda()}
                >
                  {isRunning === "gerar-venda"
                    ? "Gerando..."
                    : "Gerar venda"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}


