// apps/web/src/features/tenant-admin/transacoes/pages/TransacaoDetailsPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import {
  formatClienteLabel,
  formatDateTime,
  formatFornecedorLabel,
  formatMoney,
  formatTransacaoLabel,
  shortCode,
} from "../../../../shared/formatters";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { transacoesApi } from "../api/transacoesApi";
import type { TransacaoDetalhada } from "../tipos";
import "../../shared/entityPages.css";

function statusClass(status?: string | null): string {
  switch (status) {
    case "CONCLUIDA":
      return "ck-status ck-status-success";
    case "CANCELADA":
      return "ck-status ck-status-danger";
    default:
      return "ck-status ck-status-warning";
  }
}

function tipoLabel(tipo: string): string {
  return tipo === "COMPRA" ? "Compra" : "Venda";
}

export default function TransacaoDetailsPage() {
  const params = useParams<{ transacaoId: string }>();
  const transacaoId = params.transacaoId?.trim();

  const [transacao, setTransacao] = useState<TransacaoDetalhada | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState<"confirmar" | "cancelar" | null>(
    null,
  );

  async function carregar() {
    if (!transacaoId) {
      setErro("Transação inválida.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const response = await transacoesApi.obter(transacaoId);
      const item = response.item;

      setTransacao(item);

      if (item.clienteId) {
        const clienteResponse = await clientesApi.obter(item.clienteId);
        setCliente(clienteResponse.item);
      } else {
        setCliente(null);
      }

      if (item.fornecedorId) {
        const fornecedorResponse = await fornecedoresApi.obter(
          item.fornecedorId,
        );
        setFornecedor(fornecedorResponse.item);
      } else {
        setFornecedor(null);
      }
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, [transacaoId]);

  async function confirmar() {
    if (!transacaoId) return;

    setIsRunning("confirmar");
    setErroAcao(null);

    try {
      await transacoesApi.confirmar(transacaoId);
      await carregar();
    } catch (error) {
      setErroAcao(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  async function cancelar() {
    if (!transacaoId) return;

    setIsRunning("cancelar");
    setErroAcao(null);

    try {
      await transacoesApi.cancelar(transacaoId, {
        motivo: motivoCancelamento.trim() || null,
      });

      await carregar();
    } catch (error) {
      setErroAcao(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  const pessoaLabel = useMemo(() => {
    if (cliente) return formatClienteLabel(cliente);
    if (fornecedor) return formatFornecedorLabel(fornecedor);

    if (transacao?.clienteId) return "Cliente não carregado";
    if (transacao?.fornecedorId) return "Fornecedor não carregado";

    return "Pessoa não vinculada";
  }, [cliente, fornecedor, transacao]);

  if (isLoading) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-card">Carregando transação...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-alert">{erro}</div>
      </div>
    );
  }

  if (!transacao) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-alert">Transação não encontrada.</div>
      </div>
    );
  }

  return (
    <div className="ck-entity-page">
      <section className="ck-entity-hero">
        <div>
          <p className="ck-entity-kicker">Transação</p>
          <h1>{formatTransacaoLabel(transacao)}</h1>
          <p>
            {tipoLabel(transacao.tipo)} — Ref. {shortCode(transacao.transacaoId)}
          </p>
        </div>

        <div className="ck-entity-page__actions">
          <Link className="ck-entity-button" to="/app/transacoes">
            Lista de transações
          </Link>
        </div>
      </section>

      {erroAcao ? <div className="ck-entity-alert">{erroAcao}</div> : null}

      <section className="ck-entity-detail-grid ck-entity-detail-grid--three">
        <article className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Resumo</h2>
            <p>Identificação principal da transação.</p>
          </div>

          <dl className="ck-entity-detail-list">
            <div>
              <dt>Tipo</dt>
              <dd>{tipoLabel(transacao.tipo)}</dd>
            </div>

            <div>
              <dt>Pessoa</dt>
              <dd>{pessoaLabel}</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>
                <span className={statusClass(transacao.status)}>
                  {transacao.status}
                </span>
              </dd>
            </div>
          </dl>
        </article>

        <article className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Valores</h2>
            <p>Composição financeira da transação.</p>
          </div>

          <dl className="ck-entity-detail-list">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatMoney(transacao.valorSubtotal)}</dd>
            </div>

            <div>
              <dt>Desconto</dt>
              <dd>{formatMoney(transacao.valorDesconto)}</dd>
            </div>

            <div>
              <dt>Acréscimo</dt>
              <dd>{formatMoney(transacao.valorAcrescimo)}</dd>
            </div>

            <div>
              <dt>Total</dt>
              <dd>{formatMoney(transacao.valorTotal)}</dd>
            </div>
          </dl>
        </article>

        <article className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Datas</h2>
            <p>Registro e atualização.</p>
          </div>

          <dl className="ck-entity-detail-list">
            <div>
              <dt>Criada em</dt>
              <dd>{formatDateTime(transacao.criadoEm)}</dd>
            </div>

            <div>
              <dt>Atualizada em</dt>
              <dd>{formatDateTime(transacao.atualizadoEm)}</dd>
            </div>

            <div>
              <dt>Cancelada em</dt>
              <dd>{formatDateTime(transacao.canceladoEm)}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="ck-entity-card">
        <div className="ck-entity-card__title">
          <h2>Itens</h2>
          <p>Produtos e serviços vinculados à transação.</p>
        </div>

        {transacao.itens.length === 0 ? (
          <p className="ck-entity-description">
            Nenhum item foi adicionado a esta transação.
          </p>
        ) : (
          <div className="ck-register-table-panel">
            <table className="ck-register-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Valor unitário</th>
                  <th>Desconto</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {transacao.itens.map((item) => (
                  <tr key={item.itemTransacaoId}>
                    <td>{item.descricao ?? "Item sem descrição"}</td>
                    <td>{item.tipoProduto}</td>
                    <td>{item.quantidade}</td>
                    <td>{formatMoney(item.valorUnitario)}</td>
                    <td>{formatMoney(item.valorDesconto)}</td>
                    <td>{formatMoney(item.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="ck-entity-card">
        <div className="ck-entity-card__title">
          <h2>Observação</h2>
        </div>

        <p className="ck-entity-description">
          {transacao.observacao ?? "Nenhuma observação cadastrada."}
        </p>
      </section>

      <section className="ck-entity-card">
        <div className="ck-entity-card__title">
          <h2>Ações</h2>
          <p>Confirme ou cancele a transação conforme o fluxo operacional.</p>
        </div>

        <div className="ck-entity-actions-row">
          <button
            className="ck-entity-button ck-entity-button--primary"
            type="button"
            disabled={Boolean(isRunning)}
            onClick={confirmar}
          >
            {isRunning === "confirmar" ? "Confirmando..." : "Confirmar"}
          </button>
        </div>

        <div className="ck-entity-form-grid">
          <label className="ck-entity-field ck-entity-field--wide">
            <span>Motivo do cancelamento</span>
            <textarea
              value={motivoCancelamento}
              onChange={(event) => setMotivoCancelamento(event.target.value)}
              placeholder="Opcional"
              rows={4}
            />
          </label>
        </div>

        <div className="ck-entity-actions-row">
          <button
            className="ck-entity-button"
            type="button"
            disabled={Boolean(isRunning)}
            onClick={cancelar}
          >
            {isRunning === "cancelar" ? "Cancelando..." : "Cancelar"}
          </button>
        </div>
      </section>
    </div>
  );
}
