// apps/web/src/features/superadmin/locatarios/pages/LocatarioDetailsPage.tsx

import { Link, useParams } from "react-router-dom";
import { useLocatario } from "../hooks/useLocatario";
import { useLocatarioActions } from "../hooks/useLocatarioActions";

export default function LocatarioDetailsPage() {
  const params = useParams<{ locatarioId: string }>();
  const locatarioId = params.locatarioId?.trim();

  const { item, isLoading, erro, recarregar } = useLocatario(locatarioId);
  const {
    erro: erroAcao,
    isRunning,
    suspender,
    reativar,
    encerrar,
  } = useLocatarioActions(async () => {
    await recarregar();
  });

  if (isLoading) {
    return <div className="rounded-2xl border bg-white p-6">Carregando locatário...</div>;
  }

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {erro}
      </div>
    );
  }

  if (!item || !locatarioId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Locatário não encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{item.nome}</h1>
          <p className="text-sm text-slate-600">{item.email}</p>
        </div>

        <div className="flex gap-3">
          <Link
            className="rounded-xl border px-4 py-2"
            to={`/superadmin/locatarios/${locatarioId}/editar`}
          >
            Editar
          </Link>
        </div>
      </div>

      {erroAcao ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erroAcao}
        </div>
      ) : null}

      <div className="grid gap-3 rounded-2xl border bg-white p-6 text-sm">
        <div><strong>ID:</strong> {item.locatarioId}</div>
        <div><strong>Slug:</strong> {item.slug}</div>
        <div><strong>Status:</strong> {item.status}</div>
        <div><strong>Documento:</strong> {item.documento ?? "-"}</div>
        <div><strong>Fuso horário:</strong> {item.fusoHorario ?? "-"}</div>
        <div><strong>Criado em:</strong> {item.criadoEm ?? "-"}</div>
        <div><strong>Atualizado em:</strong> {item.atualizadoEm ?? "-"}</div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-xl border px-4 py-2"
          type="button"
          onClick={() => void suspender(locatarioId)}
          disabled={isRunning !== null}
        >
          {isRunning === "suspender" ? "Suspendendo..." : "Suspender"}
        </button>

        <button
          className="rounded-xl border px-4 py-2"
          type="button"
          onClick={() => void reativar(locatarioId)}
          disabled={isRunning !== null}
        >
          {isRunning === "reativar" ? "Reativando..." : "Reativar"}
        </button>

        <button
          className="rounded-xl border px-4 py-2 text-red-700"
          type="button"
          onClick={() => void encerrar(locatarioId)}
          disabled={isRunning !== null}
        >
          {isRunning === "encerrar" ? "Encerrando..." : "Encerrar"}
        </button>
      </div>
    </div>
  );
}