// apps/web/src/features/tenant-admin/transacoes/pages/TransacaoDetailsPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  TRANSACOES_MODULE,
  TRANSACOES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { mapError } from "../../../../core/errors/mapError";
import { PageGuard } from "../../../../core/routing/pageGuard";
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
  TransacaoItem,
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

function produtoLabel(produto: Produto): string {
  return `${produto.nome} • ${produto.tipo} • ${formatMoney(produto.precoVenda)}`;
}

function valorComoTexto(valor?: number | null): string {
  return typeof valor === "number" && Number.isFinite(valor) ? String(valor) : "";
}

function podeEditarItens(status?: string | null): boolean {
  return status === "RASCUNHO" || status === "ABERTA";
}

export default function TransacaoDetailsPage() {
  const params = useParams<{ transacaoId: string }>();
  const transacaoId = params.transacaoId?.trim();
  const permissions = useTransacoesPermissions();

  const [transacao, setTransacao] = useState<TransacaoDetalhada | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [erroItens, setErroItens] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [novoItem, setNovoItem] = useState<AdicionarItemTransacaoInput>({
    produtoId: "",
    quantidade: 1,
    valorUnitario: 0,
    valorDesconto: 0,
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemEmEdicao, setItemEmEdicao] = useState<AtualizarItemTransacaoInput>({
    descricao: "",
    quantidade: 1,
    valorUnitario: 0,
    valorDesconto: 0,
  });
  const [isRunning, setIsRunning] = useState<
    "confirmar" | "cancelar" | "adicionar-item" | "atualizar-item" | "remover-item" | null
  >(null);

  async function carregar() {
    if (!transacaoId) {
      setErro("Transação inválida.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const [response, produtosResponse] = await Promise.all([
        transacoesApi.obter(transacaoId),
        produtosApi.listar().catch(() => ({ itens: [] as Produto[] })),
      ]);
      const item = response.item;

      setTransacao(item);
      setProdutos(produtosResponse.itens);

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

  function iniciarEdicao(item: TransacaoItem) {
    setEditingItemId(item.itemTransacaoId);
    setErroItens(null);
    setItemEmEdicao({
      descricao: item.descricao ?? "",
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorDesconto: item.valorDesconto,
    });
  }

  function cancelarEdicao() {
    setEditingItemId(null);
    setItemEmEdicao({
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      valorDesconto: 0,
    });
  }

  async function salvarEdicao(itemId: string) {
    if (!transacaoId) return;

    setIsRunning("atualizar-item");
    setErroItens(null);

    try {
      await transacoesApi.atualizarItem(transacaoId, itemId, {
        descricao: itemEmEdicao.descricao ?? "",
        quantidade: Number(itemEmEdicao.quantidade) || 1,
        valorUnitario: Number(itemEmEdicao.valorUnitario) || 0,
        valorDesconto: Number(itemEmEdicao.valorDesconto) || 0,
      });

      cancelarEdicao();
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
      if (editingItemId === itemId) {
        cancelarEdicao();
      }
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

  const itensEditaveis = podeEditarItens(transacao?.status) && permissions.canEdit;

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
          <EntityFormGrid>
            <EntityField label="Produto ou serviço" wide>
              <select
                value={novoItem.produtoId}
                onChange={(event) =>
                  setNovoItem((current) => ({
                    ...current,
                    produtoId: event.target.value,
                  }))
                }
              >
                <option value="">Selecione um item</option>
                {produtos.map((produto) => (
                  <option key={produto.produtoId} value={produto.produtoId}>
                    {produtoLabel(produto)}
                  </option>
                ))}
              </select>
            </EntityField>

            <EntityField label="Quantidade">
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={novoItem.quantidade}
                onChange={(event) =>
                  setNovoItem((current) => ({
                    ...current,
                    quantidade: Number(event.target.value),
                  }))
                }
              />
            </EntityField>

            <EntityField label="Valor unitário">
              <input
                type="number"
                min="0"
                step="0.01"
                value={novoItem.valorUnitario}
                onChange={(event) =>
                  setNovoItem((current) => ({
                    ...current,
                    valorUnitario: Number(event.target.value),
                  }))
                }
              />
            </EntityField>

            <EntityField label="Desconto">
              <input
                type="number"
                min="0"
                step="0.01"
                value={novoItem.valorDesconto ?? 0}
                onChange={(event) =>
                  setNovoItem((current) => ({
                    ...current,
                    valorDesconto: Number(event.target.value),
                  }))
                }
              />
            </EntityField>
          </EntityFormGrid>
        ) : (
          <p className="ck-entity-description">
            Itens só podem ser alterados quando a transação estiver em rascunho ou aberta.
          </p>
        )}

        {itensEditaveis ? (
          <EntityActions>
            <EntityButton
              type="button"
              variant="primary"
              disabled={isRunning !== null || produtos.length === 0}
              onClick={adicionarItem}
            >
              {isRunning === "adicionar-item" ? "Adicionando..." : "Adicionar item"}
            </EntityButton>
          </EntityActions>
        ) : null}

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
                  <th>Subtotal</th>
                  <th>Desconto</th>
                  <th>Total</th>
                  {itensEditaveis ? <th>Ações</th> : null}
                </tr>
              </thead>

              <tbody>
                {transacao.itens.map((item) => (
                  <tr key={item.itemTransacaoId}>
                    <td>
                      {editingItemId === item.itemTransacaoId ? (
                        <input
                          value={itemEmEdicao.descricao ?? ""}
                          onChange={(event) =>
                            setItemEmEdicao((current) => ({
                              ...current,
                              descricao: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        item.descricao ?? "Item sem descrição"
                      )}
                    </td>
                    <td>{item.tipoProduto}</td>
                    <td>
                      {editingItemId === item.itemTransacaoId ? (
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={valorComoTexto(itemEmEdicao.quantidade)}
                          onChange={(event) =>
                            setItemEmEdicao((current) => ({
                              ...current,
                              quantidade: Number(event.target.value),
                            }))
                          }
                        />
                      ) : (
                        item.quantidade
                      )}
                    </td>
                    <td>
                      {editingItemId === item.itemTransacaoId ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={valorComoTexto(itemEmEdicao.valorUnitario)}
                          onChange={(event) =>
                            setItemEmEdicao((current) => ({
                              ...current,
                              valorUnitario: Number(event.target.value),
                            }))
                          }
                        />
                      ) : (
                        formatMoney(item.valorUnitario)
                      )}
                    </td>
                    <td>{formatMoney(item.valorSubtotal)}</td>
                    <td>
                      {editingItemId === item.itemTransacaoId ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={valorComoTexto(itemEmEdicao.valorDesconto)}
                          onChange={(event) =>
                            setItemEmEdicao((current) => ({
                              ...current,
                              valorDesconto: Number(event.target.value),
                            }))
                          }
                        />
                      ) : (
                        formatMoney(item.valorDesconto)
                      )}
                    </td>
                    <td>{formatMoney(item.valorTotal)}</td>
                    {itensEditaveis ? (
                      <td>
                        <EntityActions>
                          {editingItemId === item.itemTransacaoId ? (
                            <>
                              <EntityButton
                                type="button"
                                variant="primary"
                                disabled={isRunning !== null}
                                onClick={() => salvarEdicao(item.itemTransacaoId)}
                              >
                                {isRunning === "atualizar-item" ? "Salvando..." : "Salvar"}
                              </EntityButton>
                              <EntityButton
                                type="button"
                                disabled={isRunning !== null}
                                onClick={cancelarEdicao}
                              >
                                Cancelar
                              </EntityButton>
                            </>
                          ) : (
                            <>
                              <EntityButton
                                type="button"
                                disabled={isRunning !== null}
                                onClick={() => iniciarEdicao(item)}
                              >
                                Editar
                              </EntityButton>
                              <EntityButton
                                type="button"
                                disabled={isRunning !== null}
                                onClick={() => removerItem(item.itemTransacaoId)}
                              >
                                {isRunning === "remover-item" ? "Removendo..." : "Remover"}
                              </EntityButton>
                            </>
                          )}
                        </EntityActions>
                      </td>
                    ) : null}
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
        {permissions.canEdit ? (
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

        <EntityFormGrid>
          <EntityField label="Motivo do cancelamento" wide>
            <textarea
              value={motivoCancelamento}
              onChange={(event) => setMotivoCancelamento(event.target.value)}
              placeholder="Opcional"
              rows={4}
              disabled={!permissions.canCancel}
            />
          </EntityField>
        </EntityFormGrid>

        {permissions.canCancel ? (
          <EntityActions>
            <EntityButton
              type="button"
              disabled={Boolean(isRunning)}
              onClick={cancelar}
            >
              {isRunning === "cancelar" ? "Cancelando..." : "Cancelar"}
            </EntityButton>
          </EntityActions>
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
