// apps/web/src/features/tenant-admin/transacoes/pages/TransacoesListPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { TransacoesTable } from "../components/TransacoesTable";
import { useTransacoes } from "../hooks/useTransacoes";
import type { Transacao } from "../tipos";

type FiltroTipo = "TODOS" | "VENDA" | "COMPRA";

function codigoCurto(id: string): string {
  return id.slice(0, 8).toLowerCase();
}

function normalizar(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
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
        if (ativo) {
          setErroApoio(mapError(error).message);
        }
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

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transações</h1>
          <p className="text-sm text-slate-600">
            Acompanhe vendas e compras por cliente, fornecedor, status e valor.
          </p>
        </div>

        <div className="flex gap-2">
          <Link className="rounded-xl border px-4 py-2" to="/app/vendas/nova">
            Nova venda
          </Link>

          <Link className="rounded-xl border px-4 py-2" to="/app/compras/nova">
            Nova compra
          </Link>
        </div>
      </div>

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

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      {erroApoio ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Não foi possível carregar nomes de clientes/fornecedores. A listagem
          continuará funcionando com dados internos. Detalhe: {erroApoio}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6">
          Carregando transações...
        </div>
      ) : (
        <TransacoesTable
          itens={transacoesFiltradas}
          clientes={clientes}
          fornecedores={fornecedores}
        />
      )}
    </div>
  );
}
