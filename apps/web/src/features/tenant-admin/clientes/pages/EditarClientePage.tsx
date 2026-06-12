// apps/web/src/features/tenant-admin/clientes/pages/EditarClientePage.tsx

import { useNavigate, useParams } from "react-router-dom";
import { ClienteForm } from "../components/ClienteForm";
import { useClienteDetails } from "../hooks/useClienteDetails";
import { useSalvarCliente } from "../hooks/useSalvarCliente";
import type { AtualizarClienteInput, CriarClienteInput } from "../tipos";

export default function EditarClientePage() {
  const navigate = useNavigate();
  const params = useParams<{ clienteId: string }>();
  const clienteId = params.clienteId?.trim();

  const { cliente, isLoading, erro: erroCarga } = useClienteDetails(clienteId);

  const { salvar, isSaving, erro } = useSalvarCliente({
    mode: "edit",
    clienteId,
    onSuccess: () => navigate(clienteId ? `/app/clientes/${clienteId}` : "/app/clientes"),
  });

  async function handleSubmit(input: CriarClienteInput | AtualizarClienteInput) {
    await salvar(input);
  }

  if (isLoading) {
    return <div className="rounded-2xl border bg-white p-6">Carregando cliente...</div>;
  }

  if (erroCarga) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {erroCarga}
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
      <div>
        <h1 className="text-2xl font-semibold">Editar cliente</h1>
        <p className="text-sm text-slate-600">
          Atualize os dados do cliente.
        </p>
      </div>

      <ClienteForm
        mode="edit"
        initialData={cliente}
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </div>
  );
}