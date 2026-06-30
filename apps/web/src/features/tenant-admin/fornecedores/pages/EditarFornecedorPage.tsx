// apps/web/src/features/tenant-admin/fornecedores/pages/EditarFornecedorPage.tsx

import { useNavigate, useParams } from "react-router-dom";
import {
  FORNECEDORES_MODULE,
  FORNECEDORES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";
import {
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityPage,
} from "../../shared/entity-ui";
import { FornecedorForm } from "../components/FornecedorForm";
import { useFornecedorDetails } from "../hooks/useFornecedorDetails";
import { useSalvarFornecedor } from "../hooks/useSalvarFornecedor";
import type { AtualizarFornecedorInput, CriarFornecedorInput } from "../tipos";

export default function EditarFornecedorPage() {
  const navigate = useNavigate();
  const params = useParams<{ fornecedorId: string }>();
  const fornecedorId = params.fornecedorId?.trim();

  const {
    fornecedor,
    isLoading,
    erro: erroCarga,
  } = useFornecedorDetails(fornecedorId);

  const { salvar, isSaving, erro } = useSalvarFornecedor({
    mode: "edit",
    fornecedorId,
    onSuccess: () =>
      navigate(
        fornecedorId
          ? `/app/fornecedores/${fornecedorId}`
          : "/app/fornecedores",
      ),
  });

  async function handleSubmit(
    input: CriarFornecedorInput | AtualizarFornecedorInput,
  ) {
    await salvar(input);
  }

  if (isLoading) {
    return (
      <EntityPage>
        <EntityCard>Carregando fornecedor...</EntityCard>
      </EntityPage>
    );
  }

  if (erroCarga) {
    return (
      <EntityPage>
        <EntityAlert>{erroCarga}</EntityAlert>
      </EntityPage>
    );
  }

  if (!fornecedor) {
    return (
      <EntityPage>
        <EntityAlert>Fornecedor não encontrado.</EntityAlert>
      </EntityPage>
    );
  }

  return (
    <PageGuard
      requiredModule={FORNECEDORES_MODULE}
      requiredPermissions={[FORNECEDORES_PERMISSIONS.ATUALIZAR]}
    >
      <EntityPage
        actions={
          <>
            <EntityButton to={`/app/fornecedores/${fornecedor.fornecedorId}`}>
              Voltar para detalhes
            </EntityButton>

            <EntityButton to="/app/fornecedores">
              Lista de fornecedores
            </EntityButton>
          </>
        }
      >
        <FornecedorForm
          mode="edit"
          initialData={fornecedor}
          isSaving={isSaving}
          erro={erro}
          onSubmit={handleSubmit}
        />
      </EntityPage>
    </PageGuard>
  );
}
