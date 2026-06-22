// apps/web/src/features/tenant-admin/transacoes/pages/TransacaoDetailsPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
import {
  EntityActions,
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityDetailGrid,
  EntityDetailList,
  EntityField,
  EntityFormGrid,
  EntityHero,
  EntityPage,
} from "../../shared/entity-ui";
import { transacoesApi } from "../api/transacoesApi";
import type { TransacaoDetalhada } from "../tipos";

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
      <EntityPage>
        <EntityCard>Carregando transação...</EntityCard>
      </EntityPage>
    );
  }

  if (erro) {
    return (
      <EntityPage>
        <EntityAlert>{erro}</EntityAlert>
      </EntityPage>
    );
  }

  if (!transacao) {
    return (
      <EntityPage>
        <EntityAlert>Transação não encontrada.</EntityAlert>
      </EntityPage>
    );
  }

  return (
    <EntityPage>
      <EntityHero
        kicker="Transação"
        title={formatTransacaoLabel(transacao)}
        description={`${tipoLabel(transacao.tipo)} — Ref. ${shortCode(
          transacao.transacaoId,
        )}`}
        actions={
          <EntityButton to="/app/transacoes">
            Lista de transações
          </EntityButton>
        }
      />

      {erroAcao ? <EntityAlert>{erroAcao}</EntityAlert> : null}

      <EntityDetailGrid columns={3}>
        <EntityCard
          title="Resumo"
          description="Identificação principal da transação."
        >
          <EntityDetailList
            items={[
              { label: "Tipo", value: tipoLabel(transacao.tipo) },
              { label: "Pessoa", value: pessoaLabel },
              {
                label: "Status",
                value: (
                  <span className={statusClass(transacao.status)}>
                    {transacao.status}
                  </span>
                ),
              },
            ]}
          />
        </EntityCard>

        <EntityCard
          title="Valores"
          description="Composição financeira da transação."
        >
          <EntityDetailList
            items={[
              { label: "Subtotal", value: formatMoney(transacao.valorSubtotal) },
              { label: "Desconto", value: formatMoney(transacao.valorDesconto) },
              {
                label: "Acréscimo",
                value: formatMoney(transacao.valorAcrescimo),
              },
              { label: "Total", value: formatMoney(transacao.valorTotal) },
            ]}
          />
        </EntityCard>

        <EntityCard title="Datas" description="Registro e atualização.">
          <EntityDetailList
            items={[
              { label: "Criada em", value: formatDateTime(transacao.criadoEm) },
              {
                label: "Atualizada em",
                value: formatDateTime(transacao.atualizadoEm),
              },
              {
                label: "Cancelada em",
                value: formatDateTime(transacao.canceladoEm),
              },
            ]}
          />
        </EntityCard>
      </EntityDetailGrid>

      <EntityCard title="Itens" description="Produtos e serviços vinculados à transação.">
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
      </EntityCard>

      <EntityCard title="Observação">
        <p className="ck-entity-description">
          {transacao.observacao ?? "Nenhuma observação cadastrada."}
        </p>
      </EntityCard>

      <EntityCard
        title="Ações"
        description="Confirme ou cancele a transação conforme o fluxo operacional."
      >
        <EntityActions>
          <EntityButton
            type="button"
            variant="primary"
            disabled={Boolean(isRunning)}
            onClick={confirmar}
          >
            {isRunning === "confirmar" ? "Confirmando..." : "Confirmar"}
          </EntityButton>
        </EntityActions>

        <EntityFormGrid>
          <EntityField label="Motivo do cancelamento" wide>
            <textarea
              value={motivoCancelamento}
              onChange={(event) => setMotivoCancelamento(event.target.value)}
              placeholder="Opcional"
              rows={4}
            />
          </EntityField>
        </EntityFormGrid>

        <EntityActions>
          <EntityButton
            type="button"
            disabled={Boolean(isRunning)}
            onClick={cancelar}
          >
            {isRunning === "cancelar" ? "Cancelando..." : "Cancelar"}
          </EntityButton>
        </EntityActions>
      </EntityCard>
    </EntityPage>
  );
}
