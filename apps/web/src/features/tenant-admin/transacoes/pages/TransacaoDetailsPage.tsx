// apps/web/src/features/tenant-admin/transacoes/pages/TransacaoDetailsPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { produtosApi } from "../../produtos/api/produtosApi";
import type { Produto } from "../../produtos/tipos";
import { useTransacaoActions } from "../hooks/useTransacaoActions";
import { useTransacaoDetails } from "../hooks/useTransacaoDetails";

function parseNumero(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatarMoeda(valor?: number | string | null): string {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarNumero(valor?: number | string | null): string {
  return Number(valor ?? 0).toLocaleString("pt-BR");
}

function formatarData(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR");
}

function valorTexto(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  return String(valor);
}

function codigoCurto(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function labelProduto(produto: Produto): string {
  return produto.sku ? `${produto.nome} — ${produto.sku}` : produto.nome;
}

function labelCliente(cliente: Cliente): string {
  return cliente.documento ? `${cliente.nome} — ${cliente.documento}` : cliente.nome;
}

function labelFornecedor(fornecedor: Fornecedor): string {
  return fornecedor.documento
    ? `${fornecedor.nome} — ${fornecedor.documento}`
    : fornecedor.nome;
}

export default function TransacaoDetailsPage() {
  const params = useParams<{ transacaoId: string }>();
  const transacaoId = params.transacaoId?.trim();

  const { transacao, isLoading, erro, recarregar } =
    useTransacaoDetails(transacaoId);

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

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erroApoio, setErroApoio] = useState<string | null>(null);

  const [produtoId, setProdutoId] = useState("");
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

  useEffect(() => {
    let ativo = true;

    async function carregarDadosDeApoio() {
      setErroApoio(null);

      try {
        const [clientesResponse, fornecedoresResponse, produtosResponse] =
          await Promise.all([
            clientesApi.listar(),
            fornecedoresApi.listar(),
            produtosApi.listar(),
          ]);

        if (!ativo) return;

        setClientes(clientesResponse.itens);
        setFornecedores(fornecedoresResponse.itens);
        setProdutos(produtosResponse.itens);
      } catch (error) {
        if (ativo) setErroApoio(mapError(error).message);
      }
    }

    void carregarDadosDeApoio();

    return () => {
      ativo = false;
    };
  }, []);

  const clientesPorId = useMemo(
    () => new Map(clientes.map((cliente) => [cliente.clienteId, cliente])),
    [clientes],
  );

  const fornecedoresPorId = useMemo(
    () =>
      new Map(
        fornecedores.map((fornecedor) => [
          fornecedor.fornecedorId,
          fornecedor,
        ]),
      ),
    [fornecedores],
  );

  const produtosPorId = useMemo(
    () => new Map(produtos.map((produto) => [produto.produtoId, produto])),
    [produtos],
  );

  async function handleAdicionarItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await adicionarItem({
      produtoId: produtoId.trim(),
      estoqueId: null,
      descricao: descricao.trim() || null,
      quantidade: parseNumero(quantidade),
      valorUnitario: parseNumero(valorUnitario),
      valorDesconto: parseNumero(valorDesconto),
    });

    setProdutoId("");
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

  function handleSelecionarProduto(value: string) {
    setProdutoId(value);

    const produto = produtosPorId.get(value);
    if (!produto) return;

    setValorUnitario(String(produto.precoVenda ?? 0));

    if (!descricao.trim() && produto.descricao) {
      setDescricao(produto.descricao);
    }
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

  const podeEditar =
    transacao.status === "ABERTA" || transacao.status === "RASCUNHO";

  const itens = transacao.itens ?? [];
  const codigoTransacao = codigoCurto(transacao.transacaoId);

  const cliente = transacao.clienteId
    ? clientesPorId.get(transacao.clienteId)
    : undefined;

  const fornecedor = transacao.fornecedorId
    ? fornecedoresPorId.get(transacao.fornecedorId)
    : undefined;

  const pessoaTitulo = transacao.tipo === "COMPRA" ? "Fornecedor" : "Cliente";
  const pessoaNome =
    transacao.tipo === "COMPRA"
      ? fornecedor
        ? labelFornecedor(fornecedor)
        : transacao.fornecedorId
          ? `Fornecedor ${codigoCurto(transacao.fornecedorId)}`
          : "—"
      : cliente
        ? labelCliente(cliente)
        : transacao.clienteId
          ? `Cliente ${codigoCurto(transacao.clienteId)}`
          : "—";

  const pessoaDocumento =
    transacao.tipo === "COMPRA" ? fornecedor?.documento : cliente?.documento;
  const pessoaEmail =
    transacao.tipo === "COMPRA" ? fornecedor?.email : cliente?.email;
  const pessoaTelefone =
    transacao.tipo === "COMPRA" ? fornecedor?.telefone : cliente?.telefone;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600">
            Transações / {transacao.tipo === "COMPRA" ? "Compras" : "Vendas"}
          </p>

          <h1 className="text-2xl font-semibold">
            {transacao.tipo} #{codigoTransacao}
          </h1>

          <p className="text-sm text-slate-600">
            Status: <strong>{transacao.status}</strong>
          </p>
        </div>

        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className="text-xs text-slate-500">
              Motivo do cancelamento
            </span>
            <input
              className="rounded-xl border px-3 py-2"
              placeholder="Informe apenas se for cancelar"
              value={motivoCancelamento}
              onChange={(event) => setMotivoCancelamento(event.target.value)}
            />
          </label>

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

      {erroApoio ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Não foi possível carregar alguns dados auxiliares. A tela usará dados
          internos como fallback. Detalhe: {erroApoio}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="grid gap-3 rounded-2xl border bg-white p-6 text-sm">
          <h2 className="text-lg font-semibold">Informações gerais</h2>

          <div>
            <div className="text-xs text-slate-500">Código</div>
            <div>{codigoTransacao}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Tipo</div>
            <div>{transacao.tipo}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Status</div>
            <div>{transacao.status}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Criada em</div>
            <div>{formatarData(transacao.criadoEm)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Atualizada em</div>
            <div>{formatarData(transacao.atualizadoEm)}</div>
          </div>

          <details className="text-slate-500">
            <summary className="cursor-pointer">Ver identificadores internos</summary>
            <div className="mt-2 grid gap-1">
              <div>Transação ID: {transacao.transacaoId}</div>
              <div>Locatário ID: {transacao.locatarioId}</div>
            </div>
          </details>
        </section>

        <section className="grid gap-3 rounded-2xl border bg-white p-6 text-sm">
          <h2 className="text-lg font-semibold">Dados de {pessoaTitulo.toLowerCase()}</h2>

          <div>
            <div className="text-xs text-slate-500">{pessoaTitulo}</div>
            <div>{pessoaNome}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Documento</div>
            <div>{valorTexto(pessoaDocumento)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">E-mail</div>
            <div>{valorTexto(pessoaEmail)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Telefone</div>
            <div>{valorTexto(pessoaTelefone)}</div>
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl border bg-white p-6 text-sm">
          <h2 className="text-lg font-semibold">Resumo financeiro</h2>

          <div>
            <div className="text-xs text-slate-500">Subtotal</div>
            <div>{formatarMoeda(transacao.valorSubtotal)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Desconto</div>
            <div>{formatarMoeda(transacao.valorDesconto)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Acréscimo</div>
            <div>{formatarMoeda(transacao.valorAcrescimo)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Total</div>
            <div className="text-lg font-semibold">
              {formatarMoeda(transacao.valorTotal)}
            </div>
          </div>
        </section>
      </div>

      {transacao.observacao ? (
        <section className="rounded-2xl border bg-white p-6 text-sm">
          <h2 className="mb-2 text-lg font-semibold">Observação</h2>
          <p className="text-slate-700">{transacao.observacao}</p>
        </section>
      ) : null}

      {podeEditar ? (
        <form
          className="grid gap-4 rounded-2xl border bg-white p-6"
          onSubmit={handleAdicionarItem}
        >
          <div>
            <h2 className="text-lg font-semibold">Adicionar item</h2>
            <p className="text-sm text-slate-600">
              Selecione produto/serviço e informe quantidade e valores. O
              estoque será decidido pela movimentação automática.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-6">
            <label className="grid gap-1 md:col-span-2">
              <span className="text-xs text-slate-500">Produto/serviço</span>
              <select
                className="rounded-xl border px-3 py-2"
                value={produtoId}
                onChange={(event) => handleSelecionarProduto(event.target.value)}
                required
              >
                <option value="">Selecione...</option>

                {produtos.map((produto) => (
                  <option key={produto.produtoId} value={produto.produtoId}>
                    {labelProduto(produto)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 md:col-span-2">
              <span className="text-xs text-slate-500">Descrição</span>
              <input
                className="rounded-xl border px-3 py-2"
                placeholder="Descrição opcional"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-500">Quantidade</span>
              <input
                className="rounded-xl border px-3 py-2"
                type="text"
                inputMode="decimal"
                placeholder="Quantidade"
                value={quantidade}
                onChange={(event) => setQuantidade(event.target.value)}
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-500">Valor unitário</span>
              <input
                className="rounded-xl border px-3 py-2"
                type="text"
                inputMode="decimal"
                placeholder="Valor unitário"
                value={valorUnitario}
                onChange={(event) => setValorUnitario(event.target.value)}
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-500">Desconto</span>
              <input
                className="rounded-xl border px-3 py-2"
                type="text"
                inputMode="decimal"
                placeholder="Desconto"
                value={valorDesconto}
                onChange={(event) => setValorDesconto(event.target.value)}
              />
            </label>
          </div>

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

          <label className="grid gap-1">
            <span className="text-xs text-slate-500">Descrição</span>
            <input
              className="rounded-xl border px-3 py-2"
              placeholder="Descrição opcional"
              value={descricaoEditando}
              onChange={(event) => setDescricaoEditando(event.target.value)}
            />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-xs text-slate-500">Quantidade</span>
              <input
                className="rounded-xl border px-3 py-2"
                type="text"
                inputMode="decimal"
                value={quantidadeEditando}
                onChange={(event) => setQuantidadeEditando(event.target.value)}
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-500">Valor unitário</span>
              <input
                className="rounded-xl border px-3 py-2"
                type="text"
                inputMode="decimal"
                value={valorUnitarioEditando}
                onChange={(event) =>
                  setValorUnitarioEditando(event.target.value)
                }
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-500">Desconto</span>
              <input
                className="rounded-xl border px-3 py-2"
                type="text"
                inputMode="decimal"
                value={valorDescontoEditando}
                onChange={(event) =>
                  setValorDescontoEditando(event.target.value)
                }
              />
            </label>
          </div>

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

      <section className="overflow-x-auto rounded-2xl border bg-white">
        <div className="border-b bg-slate-50 px-4 py-3">
          <h2 className="text-lg font-semibold">
            {transacao.tipo === "COMPRA" ? "Itens da compra" : "Itens da venda"}
          </h2>
          <p className="text-sm text-slate-600">
            Produtos e serviços adicionados à transação.
          </p>
        </div>

        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="px-4 py-3">Produto/serviço</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Unidade</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Qtd.</th>
              <th className="px-4 py-3">Valor unit.</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {itens.map((item) => {
              const produto = produtosPorId.get(item.produtoId);

              return (
                <tr
                  key={item.itemTransacaoId}
                  className="border-b last:border-b-0"
                >
                  <td className="px-4 py-3">{produto?.nome ?? item.produtoId}</td>
                  <td className="px-4 py-3">{produto?.sku ?? "—"}</td>
                  <td className="px-4 py-3">{produto?.unidade ?? "—"}</td>
                  <td className="px-4 py-3">{produto?.tipo ?? item.tipoProduto}</td>
                  <td className="px-4 py-3">{item.descricao ?? produto?.descricao ?? "—"}</td>
                  <td className="px-4 py-3">{formatarNumero(item.quantidade)}</td>
                  <td className="px-4 py-3">{formatarMoeda(item.valorUnitario)}</td>
                  <td className="px-4 py-3">{formatarMoeda(item.valorDesconto)}</td>
                  <td className="px-4 py-3 font-medium">{formatarMoeda(item.valorTotal)}</td>
                  <td className="px-4 py-3">
                    {item.movimentaEstoque ? "Movimenta" : "Não movimenta"}
                  </td>
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
                            setValorUnitarioEditando(
                              String(item.valorUnitario),
                            );
                            setValorDescontoEditando(
                              String(item.valorDesconto),
                            );
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
              );
            })}

            {itens.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-slate-500"
                  colSpan={11}
                >
                  Nenhum item adicionado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
