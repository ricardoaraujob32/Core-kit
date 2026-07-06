// apps/web/src/features/tenant-admin/transacoes/pages/TransacaoDetailsPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  TRANSACOES_MODULE,
  TRANSACOES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { mapError } from "../../../../core/errors/mapError";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { useAuthorization } from "../../../../core/auth/useAuthorization";
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
import { produtosApi } from "../../produtos/api/produtosApi";
import type { Produto } from "../../produtos/tipos";
import { TransacaoItemForm } from "../components/TransacaoItemForm";
import { TransacaoItensTable } from "../components/TransacaoItensTable";
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
import { useTransacoesPermissions } from "../hooks/useTransacoesPermissions";
import type {
  AdicionarItemTransacaoInput,
  AtualizarItemTransacaoInput,
  TransacaoDetalhada,
} from "../tipos";

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



function podeEditarItens(status?: string | null): boolean {
  return status === "RASCUNHO" || status === "ABERTA";
}


export default function TransacaoDetailsPage() {
  const params = useParams<{ transacaoId: string }>();
  const transacaoId = params.transacaoId?.trim();
  const authorization = useAuthorization();
  const permissions = useTransacoesPermissions();

  const [transacao, setTransacao] = useState<TransacaoDetalhada | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [erroItens, setErroItens] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [cancelamentoAberto, setCancelamentoAberto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [novoItem, setNovoItem] = useState<AdicionarItemTransacaoInput>({
    produtoId: "",
    quantidade: 1,
    valorUnitario: 0,
    valorDesconto: 0,
  });
  const [isRunning, setIsRunning] = useState<
    "confirmar" | "cancelar" | "adicionar-item" | "atualizar-item" | "remover-item" | null
  >(null);

  async function carregar() {
    if (!permissions.canList) {
      setTransacao(null);
      setCliente(null);
      setFornecedor(null);
      setProdutos([]);
      setErro(null);
      setIsLoading(false);
      return;
    }

    if (!transacaoId) {
      setErro("Transação inválida.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const canLoadProdutos = authorization.canAccessProdutosModule();
      const canLoadClientes = authorization.canAccessClientesModule();
      const canLoadFornecedores = authorization.canAccessFornecedoresModule();
      const [response, produtosResponse] = await Promise.all([
        transacoesApi.obter(transacaoId),
        canLoadProdutos
          ? produtosApi.listar().catch(() => ({ itens: [] as Produto[] }))
          : Promise.resolve({ itens: [] as Produto[] }),
      ]);
      const item = response.item;

      setTransacao(item);
      setProdutos(produtosResponse.itens);

      if (item.clienteId && canLoadClientes) {
        const clienteResponse = await clientesApi.obter(item.clienteId);
        setCliente(clienteResponse.item);
      } else {
        setCliente(null);
      }

      if (item.fornecedorId && canLoadFornecedores) {
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
  }, [transacaoId, permissions.canList]);

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
      setCancelamentoAberto(false);
      setMotivoCancelamento("");
    } catch (error) {
      setErroAcao(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  async function adicionarItem() {
    if (!transacaoId) return;
    if (!novoItem.produtoId.trim()) {
      setErroItens("Selecione um produto ou serviço para adicionar.");
      return;
    }

    setIsRunning("adicionar-item");
    setErroItens(null);

    try {
      await transacoesApi.adicionarItem(transacaoId, {
        produtoId: novoItem.produtoId,
        quantidade: Number(novoItem.quantidade) || 1,
        valorUnitario: Number(novoItem.valorUnitario) || 0,
        valorDesconto: Number(novoItem.valorDesconto) || 0,
      });

      setNovoItem({
        produtoId: "",
        quantidade: 1,
        valorUnitario: 0,
        valorDesconto: 0,
      });
      await carregar();
    } catch (error) {
      setErroItens(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  async function atualizarItem(
    itemId: string,
    input: AtualizarItemTransacaoInput,
  ) {
    if (!transacaoId) return;

    setIsRunning("atualizar-item");
    setErroItens(null);

    try {
      await transacoesApi.atualizarItem(transacaoId, itemId, {
        descricao: input.descricao ?? "",
        quantidade: Number(input.quantidade) || 1,
        valorUnitario: Number(input.valorUnitario) || 0,
        valorDesconto: Number(input.valorDesconto) || 0,
      });

      await carregar();
    } catch (error) {
      setErroItens(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  async function removerItem(itemId: string) {
    if (!transacaoId) return;

    setIsRunning("remover-item");
    setErroItens(null);

    try {
      await transacoesApi.removerItem(transacaoId, itemId);
      await carregar();
    } catch (error) {
      setErroItens(mapError(error).message);
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

  const podeGerenciarItens =
    permissions.canEdit || permissions.canCreate;

  const itensEditaveis =
    podeEditarItens(transacao?.status) && podeGerenciarItens;


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
    <PageGuard
      requiredModule={TRANSACOES_MODULE}
      requiredPermissions={[TRANSACOES_PERMISSIONS.LISTAR]}
    >
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
        {erroItens ? <EntityAlert>{erroItens}</EntityAlert> : null}

        {itensEditaveis ? (
          <TransacaoItemForm
            produtos={produtos}
            value={novoItem}
            disabled={isRunning !== null}
            isSubmitting={isRunning === "adicionar-item"}
            onChange={setNovoItem}
            onSubmit={adicionarItem}
            onProdutoCreated={(produto) => {
              setProdutos((current) => [
                produto,
                ...current.filter((item) => item.produtoId !== produto.produtoId),
              ]);
              setNovoItem((current) => ({
                ...current,
                produtoId: produto.produtoId,
                valorUnitario: Number(produto.precoVenda ?? 0),
              }));
            }}
          />
        ) : (
          <p className="ck-entity-description">
            {podeGerenciarItens
              ? "Itens só podem ser alterados quando a transação estiver em rascunho ou aberta."
              : "Você não possui permissão para alterar os itens desta transação."}
          </p>
        )}

        <TransacaoItensTable
          itens={transacao.itens}
          editavel={itensEditaveis}
          isRunning={isRunning !== null}
          onSalvarItem={atualizarItem}
          onRemoverItem={removerItem}
        />
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
        {permissions.canConclude ? (
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
        ) : null}

        {permissions.canCancel ? (
          cancelamentoAberto ? (
            <>
              <EntityFormGrid>
                <EntityField label="Motivo do cancelamento" wide>
                  <textarea
                    value={motivoCancelamento}
                    onChange={(event) => setMotivoCancelamento(event.target.value)}
                    placeholder="Opcional"
                    rows={4}
                    disabled={isRunning === "cancelar"}
                  />
                </EntityField>
              </EntityFormGrid>

              <EntityActions>
                <EntityButton
                  type="button"
                  disabled={Boolean(isRunning)}
                  onClick={cancelar}
                >
                  {isRunning === "cancelar"
                    ? "Cancelando..."
                    : "Confirmar cancelamento"}
                </EntityButton>

                <EntityButton
                  type="button"
                  disabled={Boolean(isRunning)}
                  onClick={() => {
                    setCancelamentoAberto(false);
                    setMotivoCancelamento("");
                  }}
                >
                  Voltar
                </EntityButton>
              </EntityActions>
            </>
          ) : (
            <EntityActions>
              <EntityButton
                type="button"
                disabled={Boolean(isRunning)}
                onClick={() => setCancelamentoAberto(true)}
              >
                Cancelar
              </EntityButton>
            </EntityActions>
          )
        ) : (
          <p className="ck-entity-description">
            Você não possui permissão para alterar o status desta transação.
          </p>
        )}
      </EntityCard>
      </EntityPage>
    </PageGuard>
  );
}
