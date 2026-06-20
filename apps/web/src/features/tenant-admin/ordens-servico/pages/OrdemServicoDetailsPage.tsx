// apps/web/src/features/tenant-admin/ordens-servico/pages/OrdemServicoDetailsPage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import {
  formatClienteLabel,
  formatDateTime,
  formatMoney,
} from "../../../../shared/formatters";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { ordensServicoApi } from "../api/ordensServicoApi";
import type { OrdemServico } from "../tipos";
import "../../shared/entityPages.css";

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

  async function executarAcao(acao: AcaoOs) {
    if (!ordemServicoId) return;

    setIsRunning(acao);
    setErroAcao(null);

    try {
      if (acao === "iniciar") await ordensServicoApi.iniciar(ordemServicoId);
      if (acao === "aguardar") await ordensServicoApi.aguardar(ordemServicoId);
      if (acao === "concluir") await ordensServicoApi.concluir(ordemServicoId);
      if (acao === "cancelar") await ordensServicoApi.cancelar(ordemServicoId);

      await carregar();
    } catch (error) {
      setErroAcao(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  async function gerarVenda() {
    if (!ordemServicoId) return;

    setIsRunning("gerar-venda");
    setErroAcao(null);

    try {
      const response = await ordensServicoApi.gerarVenda(ordemServicoId, {
        valorTotal: Number(valorTotal) || 0,
        vencimentoEm: new Date().toISOString(),
      });

      navigate(`/app/transacoes/${response.item.transacaoId}`);
    } catch (error) {
      setErroAcao(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  if (erro) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-alert">{erro}</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-card">Carregando ordem de serviço...</div>
      </div>
    );
  }

  const clienteLabel = cliente
    ? formatClienteLabel(cliente)
    : "Cliente não vinculado";

  return (
    <div className="ck-entity-page">
      <section className="ck-entity-hero">
        <div>
          <p className="ck-entity-kicker">Ordem de serviço</p>
          <h1>{item.titulo ?? "Ordem de serviço"}</h1>
          <p>{clienteLabel}</p>
        </div>

        <div className="ck-entity-page__actions">
          <Link className="ck-entity-button" to="/app/ordens-servico">
            Lista de ordens
          </Link>
        </div>
      </section>

      {erroAcao ? <div className="ck-entity-alert">{erroAcao}</div> : null}

      <section className="ck-entity-detail-grid ck-entity-detail-grid--three">
        <article className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Resumo</h2>
            <p>Informações principais da ordem.</p>
          </div>

          <dl className="ck-entity-detail-list">
            <div>
              <dt>Título</dt>
              <dd>{item.titulo ?? "—"}</dd>
            </div>

            <div>
              <dt>Cliente</dt>
              <dd>{clienteLabel}</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>
                <span className={statusClass(item.status)}>{item.status}</span>
              </dd>
            </div>
          </dl>
        </article>

        <article className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Datas</h2>
            <p>Referências de abertura e registro.</p>
          </div>

          <dl className="ck-entity-detail-list">
            <div>
              <dt>Aberta em</dt>
              <dd>{formatDateTime(item.abertaEm ?? item.criadoEm)}</dd>
            </div>

            <div>
              <dt>Criada em</dt>
              <dd>{formatDateTime(item.criadoEm)}</dd>
            </div>
          </dl>
        </article>

        <article className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Ações</h2>
            <p>Atualize o andamento da ordem.</p>
          </div>

          <div className="ck-entity-actions-row">
            <button className="ck-entity-button" type="button" disabled={Boolean(isRunning)} onClick={() => executarAcao("iniciar")}>
              Iniciar
            </button>
            <button className="ck-entity-button" type="button" disabled={Boolean(isRunning)} onClick={() => executarAcao("aguardar")}>
              Aguardar
            </button>
            <button className="ck-entity-button" type="button" disabled={Boolean(isRunning)} onClick={() => executarAcao("concluir")}>
              Concluir
            </button>
            <button className="ck-entity-button" type="button" disabled={Boolean(isRunning)} onClick={() => executarAcao("cancelar")}>
              Cancelar
            </button>
          </div>
        </article>
      </section>

      <section className="ck-entity-card">
        <div className="ck-entity-card__title">
          <h2>Descrição</h2>
        </div>

        <p className="ck-entity-description">
          {item.descricao ?? "Nenhuma descrição cadastrada."}
        </p>
      </section>

      <section className="ck-entity-card">
        <div className="ck-entity-card__title">
          <h2>Gerar venda</h2>
          <p>Converta a ordem em transação financeira quando o serviço for cobrado.</p>
        </div>

        <div className="ck-entity-form-grid">
          <label className="ck-entity-field">
            <span>Valor total</span>
            <input
              inputMode="decimal"
              value={valorTotal}
              onChange={(event) => setValorTotal(event.target.value)}
              placeholder={formatMoney(0)}
            />
          </label>
        </div>

        <div className="ck-entity-actions-row">
          <button
            className="ck-entity-button ck-entity-button--primary"
            type="button"
            disabled={isRunning === "gerar-venda"}
            onClick={gerarVenda}
          >
            {isRunning === "gerar-venda" ? "Gerando..." : "Gerar venda"}
          </button>
        </div>
      </section>
    </div>
  );
}
