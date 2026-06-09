// apps/web/src/features/tenant-admin/transacoes/pages/TransacaoDetailsPage.tsx

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTransacaoActions } from "../hooks/useTransacaoActions";
import { useTransacaoDetails } from "../hooks/useTransacaoDetails";

function parseNumero(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatarMoeda(valor?: number | null): string {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function TransacaoDetailsPage() {
  const params = useParams<{ transacaoId: string }>();
  const transacaoId = params.transacaoId?.trim();

  const { transacao, isLoading, erro, recarregar } = useTransacaoDetails(transacaoId);

  const {
    adicionarItem,
    atualizarItem,
    removerItem,
    confirmar,
    cancelar,
    erro: erroAcao,
    isSubmitting,
  } = useTransacaoActions({
    transacaoId,
    onSuccess: recarregar,
  });

  const [produtoId, setProdutoId] = useState("");
  const [estoqueId, setEstoqueId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [valorUnitario, setValorUnitario] = useState("0");
  const [valorDesconto, setValorDesconto] = useState("0");

  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);
  const [descricaoEditando, setDescricaoEditando] = useState("");
  const [quantidadeEditando, setQuantidadeEditando] = useState("");
  const [valorUnitarioEditando, setValorUnitarioEditando] = useState("");
  const [valorDescontoEditando, setValorDescontoEditando] = useState("");

  async function handleAdicionarItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await adicionarItem({
      produtoId: produtoId.trim(),
      estoqueId: estoqueId.trim() || null,
      descricao: descricao.trim() || null,
      quantidade: parseNumero(quantidade),
      valorUnitario: parseNumero(valorUnitario),
      valorDesconto: parseNumero(valorDesconto),
    });

    setProdutoId("");
    setEstoqueId("");
    setDescricao("");
    setQuantidade("1");
    setValorUnitario("0");
    setValorDesconto("0");
  }

  async function handleAtualizarItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!itemEditandoId) return;

    await atualizarItem(itemEditandoId, {
      descricao: descricaoEditando.trim() || null,
      quantidade: parseNumero(quantidadeEditando),
      valorUnitario: parseNumero(valorUnitarioEditando),
      valorDesconto: parseNumero(valorDescontoEditando),
    });

    setItemEditandoId(null);
    setDescricaoEditando("");
    setQuantidadeEditando("");
    setValorUnitarioEditando("");
    setValorDescontoEditando("");
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        Carregando transação...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {erro}
      </div>
    );
  }

  if (!transacao) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Transação não encontrada.
      </div>
    );
  }

  const podeEditar = transacao.status === "ABERTA" || transacao.status === "RASCUNHO";
  const itens = transacao.itens ?? [];

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {transacao.tipo} #{transacao.transacaoId}
          </h1>
          <p className="text-sm text-slate-600">
            Status: {transacao.status}
          </p>
        </div>

        <div className="grid gap-2">
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Motivo do cancelamento"
            value={motivoCancelamento}
            onChange={(event) => setMotivoCancelamento(event.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl border px-4 py-2"
              type="button"
              disabled={isSubmitting || !podeEditar}
              onClick={() => void confirmar()}
            >
              Confirmar
            </button>

            <button
              className="rounded-xl border px-4 py-2"
              type="button"
              disabled={isSubmitting || transacao.status === "CANCELADA"}
              onClick={() =>
                void cancelar({
                  motivo: motivoCancelamento.trim() || null,
                })
              }
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {erroAcao ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erroAcao}
        </div>
      ) : null}

      <div className="grid gap-3 rounded-2xl border bg-white p-6 text-sm">
        <div><strong>ID:</strong> {transacao.transacaoId}</div>
        <div><strong>Tipo:</strong> {transacao.tipo}</div>
        <div><strong>Status:</strong> {transacao.status}</div>
        <div><strong>Cliente:</strong> {transacao.clienteId ?? "—"}</div>
        <div><strong>Fornecedor:</strong> {transacao.fornecedorId ?? "—"}</div>
        <div><strong>Subtotal:</strong> {formatarMoeda(transacao.valorSubtotal)}</div>
        <div><strong>Desconto:</strong> {formatarMoeda(transacao.valorDesconto)}</div>
        <div><strong>Acréscimo:</strong> {formatarMoeda(transacao.valorAcrescimo)}</div>
        <div><strong>Total:</strong> {formatarMoeda(transacao.valorTotal)}</div>
        <div><strong>Observação:</strong> {transacao.observacao ?? "—"}</div>
      </div>

      {podeEditar ? (
        <form
          className="grid gap-4 rounded-2xl border bg-white p-6"
          onSubmit={handleAdicionarItem}
        >
          <h2 className="text-lg font-semibold">Adicionar item</h2>

          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Produto ID"
            value={produtoId}
            onChange={(event) => setProdutoId(event.target.value)}
            required
          />

          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Estoque ID opcional"
            value={estoqueId}
            onChange={(event) => setEstoqueId(event.target.value)}
          />

          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Descrição opcional"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
          />

          <input
            className="rounded-xl border px-3 py-2"
            type="text"
            inputMode="decimal"
            placeholder="Quantidade"
            value={quantidade}
            onChange={(event) => setQuantidade(event.target.value)}
            required
          />

          <input
            className="rounded-xl border px-3 py-2"
            type="text"
            inputMode="decimal"
            placeholder="Valor unitário"
            value={valorUnitario}
            onChange={(event) => setValorUnitario(event.target.value)}
            required
          />

          <input
            className="rounded-xl border px-3 py-2"
            type="text"
            inputMode="decimal"
            placeholder="Desconto"
            value={valorDesconto}
            onChange={(event) => setValorDesconto(event.target.value)}
          />

          <div className="flex justify-end">
            <button
              className="rounded-xl border px-4 py-2"
              type="submit"
              disabled={isSubmitting}
            >
              Adicionar item
            </button>
          </div>
        </form>
      ) : null}

      {itemEditandoId ? (
        <form
          className="grid gap-4 rounded-2xl border bg-white p-6"
          onSubmit={handleAtualizarItem}
        >
          <h2 className="text-lg font-semibold">Editar item</h2>

          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Descrição opcional"
            value={descricaoEditando}
            onChange={(event) => setDescricaoEditando(event.target.value)}
          />

          <input
            className="rounded-xl border px-3 py-2"
            type="text"
            inputMode="decimal"
            value={quantidadeEditando}
            onChange={(event) => setQuantidadeEditando(event.target.value)}
            required
          />

          <input
            className="rounded-xl border px-3 py-2"
            type="text"
            inputMode="decimal"
            value={valorUnitarioEditando}
            onChange={(event) => setValorUnitarioEditando(event.target.value)}
            required
          />

          <input
            className="rounded-xl border px-3 py-2"
            type="text"
            inputMode="decimal"
            value={valorDescontoEditando}
            onChange={(event) => setValorDescontoEditando(event.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl border px-4 py-2"
              type="button"
              onClick={() => setItemEditandoId(null)}
            >
              Cancelar edição
            </button>

            <button
              className="rounded-xl border px-4 py-2"
              type="submit"
              disabled={isSubmitting}
            >
              Salvar item
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Quantidade</th>
              <th className="px-4 py-3">Valor unitário</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Movimenta estoque</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {itens.map((item) => (
              <tr key={item.itemTransacaoId} className="border-b last:border-b-0">
                <td className="px-4 py-3">{item.produtoId}</td>
                <td className="px-4 py-3">{item.descricao ?? "—"}</td>
                <td className="px-4 py-3">{item.tipoProduto}</td>
                <td className="px-4 py-3">{item.quantidade}</td>
                <td className="px-4 py-3">{formatarMoeda(item.valorUnitario)}</td>
                <td className="px-4 py-3">{formatarMoeda(item.valorDesconto)}</td>
                <td className="px-4 py-3">{formatarMoeda(item.valorTotal)}</td>
                <td className="px-4 py-3">{item.movimentaEstoque ? "Sim" : "Não"}</td>
                <td className="px-4 py-3">
                  {podeEditar ? (
                    <div className="flex gap-3">
                      <button
                        className="text-blue-600 underline"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setItemEditandoId(item.itemTransacaoId);
                          setDescricaoEditando(item.descricao ?? "");
                          setQuantidadeEditando(String(item.quantidade));
                          setValorUnitarioEditando(String(item.valorUnitario));
                          setValorDescontoEditando(String(item.valorDesconto));
                        }}
                      >
                        Editar
                      </button>

                      <button
                        className="text-red-600 underline"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => void removerItem(item.itemTransacaoId)}
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}

            {itens.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={9}>
                  Nenhum item adicionado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}