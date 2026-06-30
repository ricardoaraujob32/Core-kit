// apps/web/src/features/tenant-admin/fornecedores/pages/NovoFornecedorPage.tsx

import { useNavigate } from "react-router-dom";
import {
  FORNECEDORES_MODULE,
  FORNECEDORES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { EntityButton, EntityPage } from "../../shared/entity-ui";
import { FornecedorForm } from "../components/FornecedorForm";
import { useSalvarFornecedor } from "../hooks/useSalvarFornecedor";
import type { AtualizarFornecedorInput, CriarFornecedorInput } from "../tipos";

export default function NovoFornecedorPage() {
  const navigate = useNavigate();

  const { salvar, isSaving, erro } = useSalvarFornecedor({
    mode: "create",
    onSuccess: () => navigate("/app/fornecedores"),
  });

  async function handleSubmit(
    input: CriarFornecedorInput | AtualizarFornecedorInput,
  ) {
    await salvar(input);
  }

  return (
    <PageGuard
      requiredModule={FORNECEDORES_MODULE}
      requiredPermissions={[FORNECEDORES_PERMISSIONS.CRIAR]}
    >
      <EntityPage
        actions={
          <EntityButton to="/app/fornecedores">
            Voltar para fornecedores
          </EntityButton>
        }
      >
        <FornecedorForm
          mode="create"
          isSaving={isSaving}
          erro={erro}
          onSubmit={handleSubmit}
        />
      </EntityPage>
    </PageGuard>
  );
}
