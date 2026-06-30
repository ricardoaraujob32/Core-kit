// apps/web/src/features/superadmin/locatarios/pages/NovoLocatarioPage.tsx

import { useNavigate } from "react-router-dom";
import { SuperAdminButton, SuperAdminPage } from "../../shared";
import { LocatarioForm } from "../components/LocatarioForm";
import { useSalvarLocatario } from "../hooks/useSalvarLocatario";
import type { AtualizarLocatarioInput, CriarLocatarioInput } from "../tipos";

export default function NovoLocatarioPage() {
  const navigate = useNavigate();

  const { salvar, isSaving, erro } = useSalvarLocatario({
    mode: "create",
    onSuccess: (id) =>
      navigate(id ? `/plataforma/locatarios/${id}` : "/plataforma/locatarios"),
  });

  async function handleSubmit(input: CriarLocatarioInput | AtualizarLocatarioInput) {
    await salvar(input);
  }

  return (
    <SuperAdminPage
      kicker="Plataforma"
      title="Novo locatário"
      description="Crie uma nova empresa/tenant e sua configuração visual inicial."
      actions={
        <SuperAdminButton to="/plataforma/locatarios">
          Voltar para locatários
        </SuperAdminButton>
      }
    >
      <LocatarioForm
        mode="create"
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </SuperAdminPage>
  );
}
