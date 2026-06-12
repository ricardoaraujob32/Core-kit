// apps/web/src/features/tenant-admin/clientes/pages/ClienteDetailsPage.tsx

import { Link, useParams } from "react-router-dom";
import { useClienteDetails } from "../hooks/useClienteDetails";

export default function ClienteDetailsPage() {
  const params = useParams<{ clienteId: string }>();
  const clienteId = params.clienteId?.trim();

  const { cliente, isLoading, erro } = useClienteDetails(clienteId);

  if (isLoading) {
    return <div className="rounded-2xl border bg-white p-6">Carregando cliente...</div>;
  }

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {erro}
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Cliente não encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{cliente.nome}</h1>
          <p className="text-sm text-slate-600">
            {cliente.documento ?? "Sem documento"}
          </p>
        </div>

        <Link
          className="rounded-xl border px-4 py-2"
          to={`/app/clientes/${cliente.clienteId}/editar`}
        >
          Editar
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-white p-6 text-sm">
        <div><strong>ID:</strong> {cliente.clienteId}</div>
        <div><strong>Nome:</strong> {cliente.nome}</div>
        <div><strong>Documento:</strong> {cliente.documento ?? "—"}</div>
        <div><strong>E-mail:</strong> {cliente.email ?? "—"}</div>
        <div><strong>Telefone:</strong> {cliente.telefone ?? "—"}</div>
        <div><strong>Criado em:</strong> {cliente.criadoEm ?? "—"}</div>
        <div><strong>Atualizado em:</strong> {cliente.atualizadoEm ?? "—"}</div>
      </div>
    </div>
  );
}