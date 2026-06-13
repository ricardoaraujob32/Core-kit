// apps/web/src/features/tenant-admin/transacoes/pages/TransacoesListPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, SummaryCard } from "../../../../shared/ui";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { TransacoesTable } from "../components/TransacoesTable";
import { useTransacoes } from "../hooks/useTransacoes";
import type { Transacao } from "../tipos";

type FiltroTipo = "TODOS" | "VENDA" | "COMPRA";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function codigoCurto(id: string): string {
  return id.slice(0, 8).toLowerCase();
}

function normalizar(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function totalPorStatus(itens: Transacao[], status: string): number {
  return itens.filter((item) => item.status === status).length;
}

function somaTotal(itens: Transacao[]): number {
  return itens.reduce((acc, item) => acc + Number(item.valorTotal ?? 0), 0);
}

function labelPessoaBusca(
  transacao: Transacao,
  clientesPorId: Map<string, Cliente>,
  fornecedoresPorId: Map<string, Fornecedor>,
): string {
  if (transacao.tipo === "COMPRA" && transacao.fornecedorId) {
    const fornecedor = fornecedoresPorId.get(transacao.fornecedorId);

    return [
      fornecedor?.nome,
      fornecedor?.documento,
      fornecedor?.email,
      fornecedor?.telefone,
      transacao.fornecedorId,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (transacao.clienteId) {
    const cliente = clientesPorId.get(transacao.clienteId);

    return [
      cliente?.nome,
      cliente?.documento,
      cliente?.email,
      cliente?.telefone,
      transacao.clienteId,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

export default function TransacoesListPage() {
  const {
    transacoes,
    busca,
    setBusca,
    tipo,
    setTipo,
    isLoading,
    erro,
    recarregar,
  } = useTransacoes();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [erroApoio, setErroApoio] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarApoio() {
      setErroApoio(null);

      try {
        const [clientesResponse, fornecedoresResponse] = await Promise.all([
          clientesApi.listar(),
          fornecedoresApi.listar(),
        ]);

        if (!ativo) return;

        setClientes(clientesResponse.itens);
        setFornecedores(fornecedoresResponse.itens);
      } catch (error) {
        if (ativo) setErroApoio(mapError(error).message);
      }
    }

    void carregarApoio();

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

  const transacoesFiltradas = useMemo(() => {
    const termo = normalizar(busca);

    return transacoes.filter((transacao) => {
      const atendeTipo = tipo === "TODOS" || transacao.tipo === tipo;

      if (!termo) return atendeTipo;

      const textoBusca = [
        transacao.transacaoId,
        codigoCurto(transacao.transacaoId),
        transacao.tipo,
        transacao.status,
        transacao.observacao,
        labelPessoaBusca(transacao, clientesPorId, fornecedoresPorId),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return atendeTipo && textoBusca.includes(termo);
    });
  }, [transacoes, busca, tipo, clientesPorId, fornecedoresPorId]);

  const vendas = transacoes.filter((item) => item.tipo === "VENDA");
  const compras = transacoes.filter((item) => item.tipo === "COMPRA");
  const abertas = transacoes.filter(
    (item) => item.status === "ABERTA" || item.status === "RASCUNHO",
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transações</h1>
          <p className="text-sm text-slate-600">
            Acompanhe compras e vendas por status, pessoa vinculada e valor.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link className="rounded-xl border px-4 py-2" to="/app/vendas/nova">
            Nova venda
          </Link>

          <Link className="rounded-xl border px-4 py-2" to="/app/compras/nova">
            Nova compra
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard
          label="Vendas"
          value={formatarMoeda(somaTotal(vendas))}
          hint={`${vendas.length} transação(ões)`}
        />

        <SummaryCard
          label="Compras"
          value={formatarMoeda(somaTotal(compras))}
          hint={`${compras.length} transação(ões)`}
        />

        <SummaryCard
          label="Abertas"
          value={abertas.length}
          hint="Aguardando conclusão"
        />

        <SummaryCard
          label="Concluídas"
          value={totalPorStatus(transacoes, "CONCLUIDA")}
          hint="Histórico finalizado"
        />
      </div>

      <section className="grid gap-3 rounded-2xl border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Buscar por cliente, fornecedor, documento, status ou código"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />

          <select
            className="rounded-xl border px-3 py-2"
            value={tipo}
            onChange={(event) => setTipo(event.target.value as FiltroTipo)}
          >
            <option value="TODOS">Todos</option>
            <option value="VENDA">Vendas</option>
            <option value="COMPRA">Compras</option>
          </select>

          <button
            className="rounded-xl border px-4 py-2"
            type="button"
            onClick={() => void recarregar()}
          >
            Recarregar
          </button>
        </div>
      </section>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      {erroApoio ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Não foi possível carregar nomes de clientes/fornecedores. Detalhe:{" "}
          {erroApoio}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6">
          Carregando transações...
        </div>
      ) : transacoesFiltradas.length === 0 ? (
        <EmptyState
          title="Nenhuma transação encontrada"
          description="Crie uma venda ou compra para começar a movimentar o sistema."
          action={
            <div className="flex justify-center gap-2">
              <Link className="rounded-xl border px-4 py-2" to="/app/vendas/nova">
                Nova venda
              </Link>
              <Link className="rounded-xl border px-4 py-2" to="/app/compras/nova">
                Nova compra
              </Link>
            </div>
          }
        />
      ) : (
        <TransacoesTable
          clientes={clientes}
          fornecedores={fornecedores}
          itens={transacoesFiltradas}
        />
      )}
    </div>
  );
}
