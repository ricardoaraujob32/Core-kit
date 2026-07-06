// apps/web/src/features/tenant-admin/transacoes/components/TransacaoItensTable.tsx

import { useMemo, useState } from "react";
import { formatMoney } from "../../../../shared/formatters";
import {
  EntityActions,
  EntityButton,
} from "../../shared/entity-ui";
import type {
  AtualizarItemTransacaoInput,
  TransacaoItem,
} from "../tipos";

type FiltrosItensTransacao = {
  descricao: string;
  tipo: string;
  quantidade: string;
  valorUnitario: string;
  subtotal: string;
  desconto: string;
  total: string;
};

const FILTROS_ITENS_INICIAIS: FiltrosItensTransacao = {
  descricao: "",
  tipo: "",
  quantidade: "",
  valorUnitario: "",
  subtotal: "",
  desconto: "",
  total: "",
};

function textoContem(valor: unknown, filtro: string): boolean {
  const filtroNormalizado = filtro.trim().toLowerCase();

  if (!filtroNormalizado) return true;

  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .includes(filtroNormalizado);
}

function valorComoTexto(valor?: number | null): string {
  return typeof valor === "number" && Number.isFinite(valor)
    ? String(valor)
    : "";
}

type TransacaoItensTableProps = {
  itens: TransacaoItem[];
  editavel: boolean;
  isRunning: boolean;
  onSalvarItem: (
    itemId: string,
    input: AtualizarItemTransacaoInput,
  ) => Promise<void> | void;
  onRemoverItem: (itemId: string) => Promise<void> | void;
};

export function TransacaoItensTable({
  itens,
  editavel,
  isRunning,
  onSalvarItem,
  onRemoverItem,
}: TransacaoItensTableProps) {
  const [filtros, setFiltros] = useState<FiltrosItensTransacao>(
    FILTROS_ITENS_INICIAIS,
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemEmEdicao, setItemEmEdicao] =
    useState<AtualizarItemTransacaoInput>({
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      valorDesconto: 0,
    });

  function atualizarFiltro(campo: keyof FiltrosItensTransacao, valor: string) {
    setFiltros((current) => ({
      ...current,
      [campo]: valor,
    }));
  }

  function iniciarEdicao(item: TransacaoItem) {
    setEditingItemId(item.itemTransacaoId);
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
    await onSalvarItem(itemId, {
      descricao: itemEmEdicao.descricao ?? "",
      quantidade: Number(itemEmEdicao.quantidade) || 1,
      valorUnitario: Number(itemEmEdicao.valorUnitario) || 0,
      valorDesconto: Number(itemEmEdicao.valorDesconto) || 0,
    });

    cancelarEdicao();
  }

  async function removerItem(itemId: string) {
    await onRemoverItem(itemId);

    if (editingItemId === itemId) {
      cancelarEdicao();
    }
  }

  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set<string>();

    for (const item of itens) {
      if (item.tipoProduto) {
        tipos.add(item.tipoProduto);
      }
    }

    return Array.from(tipos).sort((a, b) => a.localeCompare(b));
  }, [itens]);

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => {
      return (
        textoContem(item.descricao ?? "Item sem descrição", filtros.descricao) &&
        textoContem(item.tipoProduto, filtros.tipo) &&
        textoContem(item.quantidade, filtros.quantidade) &&
        textoContem(item.valorUnitario, filtros.valorUnitario) &&
        textoContem(item.valorSubtotal, filtros.subtotal) &&
        textoContem(item.valorDesconto, filtros.desconto) &&
        textoContem(item.valorTotal, filtros.total)
      );
    });
  }, [itens, filtros]);

  if (itens.length === 0) {
    return (
      <p className="ck-entity-description">
        Nenhum item foi adicionado a esta transação.
      </p>
    );
  }

  return (
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
            {editavel ? <th>Ações</th> : null}
          </tr>

          <tr>
            <th>
              <input
                aria-label="Filtrar itens por descrição"
                placeholder="Descrição"
                value={filtros.descricao}
                onChange={(event) =>
                  atualizarFiltro("descricao", event.target.value)
                }
              />
            </th>

            <th>
              <select
                aria-label="Filtrar itens por tipo"
                value={filtros.tipo}
                onChange={(event) => atualizarFiltro("tipo", event.target.value)}
              >
                <option value="">Todos</option>
                {tiposDisponiveis.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </th>

            <th>
              <input
                aria-label="Filtrar itens por quantidade"
                placeholder="Qtd."
                value={filtros.quantidade}
                onChange={(event) =>
                  atualizarFiltro("quantidade", event.target.value)
                }
              />
            </th>

            <th>
              <input
                aria-label="Filtrar itens por valor unitário"
                placeholder="Unit."
                value={filtros.valorUnitario}
                onChange={(event) =>
                  atualizarFiltro("valorUnitario", event.target.value)
                }
              />
            </th>

            <th>
              <input
                aria-label="Filtrar itens por subtotal"
                placeholder="Subtotal"
                value={filtros.subtotal}
                onChange={(event) =>
                  atualizarFiltro("subtotal", event.target.value)
                }
              />
            </th>

            <th>
              <input
                aria-label="Filtrar itens por desconto"
                placeholder="Desc."
                value={filtros.desconto}
                onChange={(event) =>
                  atualizarFiltro("desconto", event.target.value)
                }
              />
            </th>

            <th>
              <input
                aria-label="Filtrar itens por total"
                placeholder="Total"
                value={filtros.total}
                onChange={(event) => atualizarFiltro("total", event.target.value)}
              />
            </th>

            {editavel ? (
              <th>
                <EntityButton
                  type="button"
                  disabled={Object.values(filtros).every(
                    (value) => !value.trim(),
                  )}
                  onClick={() => setFiltros(FILTROS_ITENS_INICIAIS)}
                >
                  Limpar
                </EntityButton>
              </th>
            ) : null}
          </tr>
        </thead>

        <tbody>
          {itensFiltrados.length === 0 ? (
            <tr>
              <td colSpan={editavel ? 8 : 7}>
                Nenhum item encontrado com os filtros informados.
              </td>
            </tr>
          ) : (
            itensFiltrados.map((item) => (
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

                {editavel ? (
                  <td>
                    <EntityActions>
                      {editingItemId === item.itemTransacaoId ? (
                        <>
                          <EntityButton
                            type="button"
                            variant="primary"
                            disabled={isRunning}
                            onClick={() => void salvarEdicao(item.itemTransacaoId)}
                          >
                            Salvar
                          </EntityButton>

                          <EntityButton
                            type="button"
                            disabled={isRunning}
                            onClick={cancelarEdicao}
                          >
                            Cancelar
                          </EntityButton>
                        </>
                      ) : (
                        <>
                          <EntityButton
                            type="button"
                            disabled={isRunning}
                            onClick={() => iniciarEdicao(item)}
                          >
                            Editar
                          </EntityButton>

                          <EntityButton
                            type="button"
                            disabled={isRunning}
                            onClick={() => void removerItem(item.itemTransacaoId)}
                          >
                            Remover
                          </EntityButton>
                        </>
                      )}
                    </EntityActions>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
