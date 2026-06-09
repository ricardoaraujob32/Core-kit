// apps/web/src/features/superadmin/locatarios/pages/UsuariosLocatarioListPage.tsx

import { Link, useParams } from "react-router-dom";
import { UsuariosLocatarioTable } from "../components/UsuariosLocatarioTable";
import { useUsuariosLocatario } from "../hooks/useUsuariosLocatario";

export default function UsuariosLocatarioListPage() {
  const params = useParams<{ locatarioId: string }>();
  const locatarioId = params.locatarioId?.trim();

  const { itens, isLoading, erro, recarregar } =
    useUsuariosLocatario(locatarioId);

  if (!locatarioId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        ID do locatário inválido.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Usuários do locatário</h1>
          <p className="text-sm text-slate-600">
            Consulte os usuários cadastrados para este locatário.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-xl border px-4 py-2"
            type="button"
            onClick={() => void recarregar()}
          >
            Recarregar
          </button>

          <Link
            className="rounded-xl border px-4 py-2"
            to={`/plataforma/locatarios/${locatarioId}`}
          >
            Voltar ao locatário
          </Link>

          <Link
            className="rounded-xl border px-4 py-2"
            to={`/plataforma/locatarios/${locatarioId}/usuarios/novo`}
          >
            Novo usuário
          </Link>
        </div>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6">
          Carregando usuários...
        </div>
      ) : (
        <UsuariosLocatarioTable itens={itens} />
      )}
    </div>
  );
}
