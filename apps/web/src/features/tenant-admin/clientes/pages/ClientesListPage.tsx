// apps/web/src/features/tenant-admin/clientes/pages/ClientesListPage.tsx

import { Link } from "react-router-dom";
import { ClientesTable } from "../components/ClientesTable";
import { useClienteActions } from "../hooks/useClienteActions";
import { useClientes } from "../hooks/useClientes";

export default function ClientesListPage() {
  const {
    clientesFiltrados,
    busca,
    setBusca,
    isLoading,
    erro,
    recarregar,
  } = useClientes();

  const {
    excluir,
    erro: erroAcao,
    isSubmitting,
  } = useClienteActions({
    onSuccess: recarregar,
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-slate-600">
            Gerencie os clientes do locatário.
          </p>
        </div>

        <Link className="rounded-xl border px-4 py-2" to="/app/clientes/novo">
          Novo cliente
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
        <div className="rounded-2xl border bg-white p-6">Carregando clientes...</div>
      ) : (
        <ClientesTable
          itens={clientesFiltrados}
          onExcluir={(clienteId) => void excluir(clienteId)}
        />
      )}
    </div>
  );
}