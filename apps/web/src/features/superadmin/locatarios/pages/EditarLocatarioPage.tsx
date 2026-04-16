// apps/web/src/features/superadmin/locatarios/pages/EditarLocatarioPage.tsx

import { useNavigate, useParams } from "react-router-dom";
import { LocatarioForm } from "../components/LocatarioForm";
import { useLocatario } from "../hooks/useLocatario";
import { useSalvarLocatario } from "../hooks/useSalvarLocatario";
import type { AtualizarLocatarioInput } from "../tipos";

export default function EditarLocatarioPage() {
  const navigate = useNavigate();
  const params = useParams<{ locatarioId: string }>();
  const locatarioId = params.locatarioId?.trim();

  const { item, isLoading, erro: erroCarga } = useLocatario(locatarioId);

  const { salvar, isSaving, erro } = useSalvarLocatario({
    mode: "edit",
    locatarioId,
    onSuccess: (id) => {
      navigate(id ? `/superadmin/locatarios/${id}` : "/superadmin/locatarios");
    },
  });

  async function handleSubmit(input: AtualizarLocatarioInput) {
    await salvar(input);
  }

  if (isLoading) {
    return <div className="rounded-2xl border bg-white p-6">Carregando locatário...</div>;
  }

  if (erroCarga) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {erroCarga}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Locatário não encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar locatário</h1>
        <p className="text-sm text-slate-600">
          Atualize os dados cadastrais do locatário.
        </p>
      </div>

      <LocatarioForm
        mode="edit"
        initialData={item}
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </div>
  );
}