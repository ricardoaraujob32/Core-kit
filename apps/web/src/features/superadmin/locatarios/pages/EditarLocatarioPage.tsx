// apps/web/src/features/superadmin/locatarios/pages/EditarLocatarioPage.tsx

import { useNavigate, useParams } from "react-router-dom";
import { SuperAdminButton, SuperAdminCard, SuperAdminPage } from "../../shared";
import { LocatarioForm } from "../components/LocatarioForm";
import { useLocatario } from "../hooks/useLocatario";
import { useSalvarLocatario } from "../hooks/useSalvarLocatario";
import type { AtualizarLocatarioInput, CriarLocatarioInput } from "../tipos";

export default function EditarLocatarioPage() {
  const navigate = useNavigate();
  const params = useParams<{ locatarioId: string }>();
  const locatarioId = params.locatarioId?.trim();

  const { item, isLoading, erro: erroCarga } = useLocatario(locatarioId);

  const { salvar, isSaving, erro } = useSalvarLocatario({
    mode: "edit",
    locatarioId,
    onSuccess: (id) =>
      navigate(id ? `/plataforma/locatarios/${id}` : "/plataforma/locatarios"),
  });

  async function handleSubmit(input: CriarLocatarioInput | AtualizarLocatarioInput) {
    await salvar(input);
  }

  if (isLoading) {
    return (
      <SuperAdminPage
        kicker="Plataforma"
        title="Editar locatário"
        description="Carregando dados do locatário."
      >
        <SuperAdminCard>Carregando locatário...</SuperAdminCard>
      </SuperAdminPage>
    );
  }

  if (erroCarga) {
    return (
      <SuperAdminPage
        kicker="Plataforma"
        title="Editar locatário"
        description="Não foi possível carregar o locatário."
      >
        <SuperAdminCard title="Erro">{erroCarga}</SuperAdminCard>
      </SuperAdminPage>
    );
  }

  if (!item) {
    return (
      <SuperAdminPage
        kicker="Plataforma"
        title="Editar locatário"
        description="Registro não encontrado."
      >
        <SuperAdminCard>Locatário não encontrado.</SuperAdminCard>
      </SuperAdminPage>
    );
  }

  return (
    <SuperAdminPage
      kicker="Plataforma"
      title={`Editar ${item.nome}`}
      description="Atualize os dados principais do locatário."
      actions={
        <>
          <SuperAdminButton to={`/plataforma/locatarios/${item.locatarioId}`}>
            Voltar para detalhes
          </SuperAdminButton>

          <SuperAdminButton to="/plataforma/locatarios">
            Lista de locatários
          </SuperAdminButton>
        </>
      }
    >
      <LocatarioForm
        mode="edit"
        initialData={item}
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </SuperAdminPage>
  );
}
