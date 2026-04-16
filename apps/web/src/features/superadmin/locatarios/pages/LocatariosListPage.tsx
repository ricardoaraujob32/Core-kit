// apps/web/src/features/superadmin/locatarios/pages/LocatariosListPage.tsx

import { Link } from "react-router-dom";
import { LocatariosTable } from "../components/LocatariosTable";
import { useLocatarios } from "../hooks/useLocatarios";

export default function LocatariosListPage() {
  const { itens, isLoading, erro, recarregar } = useLocatarios();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Locatários</h1>
          <p className="text-sm text-slate-600">
            Gerencie os locatários da plataforma.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            className="rounded-xl border px-4 py-2"
            type="button"
            onClick={() => void recarregar()}
          >
            Recarregar
          </button>

          <Link
            className="rounded-xl border px-4 py-2"
            to="/superadmin/locatarios/novo"
          >
            Novo locatário
          </Link>
        </div>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6">Carregando locatários...</div>
      ) : (
        <LocatariosTable itens={itens} />
      )}
    </div>
  );
}