// apps/web/src/features/tenant-admin/transacoes/pages/TransacoesListPage.tsx

import { Link } from "react-router-dom";
import { TransacoesTable } from "../components/TransacoesTable";
import { useTransacoes } from "../hooks/useTransacoes";

export default function TransacoesListPage() {
  const {
    transacoesFiltradas,
    busca,
    setBusca,
    tipo,
    setTipo,
    isLoading,
    erro,
    recarregar,
  } = useTransacoes();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transações</h1>
          <p className="text-sm text-slate-600">
            Gerencie vendas e compras.
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
          placeholder="Buscar por ID ou status"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />

        <select
          className="rounded-xl border px-3 py-2"
          value={tipo}
          onChange={(event) =>
            setTipo(event.target.value as "TODOS" | "VENDA" | "COMPRA")
          }
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

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6">Carregando transações...</div>
      ) : (
        <TransacoesTable itens={transacoesFiltradas} />
      )}
    </div>
  );
}