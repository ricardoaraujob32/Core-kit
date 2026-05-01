// apps/web/src/features/superadmin/locatarios/pages/NovoLocatarioPage.tsx

import { useNavigate } from "react-router-dom";
import { LocatarioForm } from "../components/LocatarioForm";
import { useSalvarLocatario } from "../hooks/useSalvarLocatario";
import type { AtualizarLocatarioInput, CriarLocatarioInput } from "../tipos";

export default function NovoLocatarioPage() {
  const navigate = useNavigate();

  const { salvar, isSaving, erro } = useSalvarLocatario({
    mode: "create",
    onSuccess: (locatarioId) => {
      navigate(locatarioId ? `/superadmin/locatarios/${locatarioId}` : "/superadmin/locatarios");
    },
  });

  async function handleSubmit(input: CriarLocatarioInput | AtualizarLocatarioInput) {
    await salvar(input);
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Novo locatário</h1>
        <p className="text-sm text-slate-600">
          Cadastre um novo locatário da plataforma.
        </p>
      </div>

      <LocatarioForm
        mode="create"
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </div>
  );
}