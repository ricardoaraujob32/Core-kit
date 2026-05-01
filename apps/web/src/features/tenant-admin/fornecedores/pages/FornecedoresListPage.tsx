// apps/web/src/features/tenant-admin/fornecedores/pages/FornecedoresListPage.tsx

import { Link } from "react-router-dom";
import { FornecedoresTable } from "../components/FornecedoresTable";
import { useFornecedorActions } from "../hooks/useFornecedorActions";
import { useFornecedores } from "../hooks/useFornecedores";

export default function FornecedoresListPage() {
  const {
    fornecedoresFiltrados,
    busca,
    setBusca,
    isLoading,
    erro,
    recarregar,
  } = useFornecedores();

  const {
    excluir,
    erro: erroAcao,
    isSubmitting,
  } = useFornecedorActions({
    onSuccess: recarregar,
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Fornecedores</h1>
          <p className="text-sm text-slate-600">
            Gerencie os fornecedores do locatário.
          </p>
        </div>

        <Link className="rounded-xl border px-4 py-2" to="/app/fornecedores/novo">
          Novo fornecedor
        </Link>
      </div>

      <div className="flex gap-3">
        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Buscar por nome, documento ou e-mail"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />

        <button
          className="rounded-xl border px-4 py-2"
          type="button"
          onClick={() => void recarregar()}
        >
          Recarregar
        </button>
      </div>

      {erro ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div> : null}
      {erroAcao ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroAcao}</div> : null}
      {isSubmitting ? <div className="rounded-xl border bg-white px-4 py-3 text-sm">Processando ação...</div> : null}

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6">Carregando fornecedores...</div>
      ) : (
        <FornecedoresTable
          itens={fornecedoresFiltrados}
          onExcluir={(fornecedorId) => void excluir(fornecedorId)}
        />
      )}
    </div>
  );
}