// apps/web/src/features/tenant-admin/produtos/pages/ProdutosListPage.tsx

import { Link } from "react-router-dom";
import { ProdutosTable } from "../components/ProdutosTable";
import { useProdutoActions } from "../hooks/useProdutoActions";
import { useProdutos } from "../hooks/useProdutos";
import type { TipoProduto } from "../tipos";

export default function ProdutosListPage() {
  const {
    produtosFiltrados,
    busca,
    setBusca,
    tipo,
    setTipo,
    isLoading,
    erro,
    recarregar,
  } = useProdutos();

  const {
    excluir,
    erro: erroAcao,
    isSubmitting,
  } = useProdutoActions({
    onSuccess: recarregar,
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Produtos e serviços</h1>
          <p className="text-sm text-slate-600">
            Gerencie produtos e serviços do locatário.
          </p>
        </div>

        <Link className="rounded-xl border px-4 py-2" to="/app/produtos/novo">
          Novo produto/serviço
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input
          className="rounded-xl border px-3 py-2"
          placeholder="Buscar por nome ou descrição"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />

        <select
          className="rounded-xl border px-3 py-2"
          value={tipo}
          onChange={(event) =>
            setTipo(event.target.value as TipoProduto | "TODOS")
          }
        >
          <option value="TODOS">Todos</option>
          <option value="PRODUTO">Produto</option>
          <option value="SERVICO">Serviço</option>
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

      {erroAcao ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erroAcao}
        </div>
      ) : null}

      {isSubmitting ? (
        <div className="rounded-xl border bg-white px-4 py-3 text-sm">
          Processando ação...
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6">
          Carregando produtos...
        </div>
      ) : (
        <ProdutosTable
          itens={produtosFiltrados}
          onExcluir={(produtoId) => void excluir(produtoId)}
        />
      )}
    </div>
  );
}