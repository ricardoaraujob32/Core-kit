// apps/web/src/features/tenant-admin/clientes/pages/NovoClientePage.tsx

import { useNavigate } from "react-router-dom";
import {
  CLIENTES_MODULE,
  CLIENTES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { EntityButton, EntityPage } from "../../shared/entity-ui";
import { ClienteForm } from "../components/ClienteForm";
import { useSalvarCliente } from "../hooks/useSalvarCliente";
import type { AtualizarClienteInput, CriarClienteInput } from "../tipos";

export default function NovoClientePage() {
  const navigate = useNavigate();

  const { salvar, isSaving, erro } = useSalvarCliente({
    mode: "create",
    onSuccess: () => navigate("/app/clientes"),
  });

  async function handleSubmit(input: CriarClienteInput | AtualizarClienteInput) {
    await salvar(input);
  }

  return (
    <PageGuard
      requiredModule={CLIENTES_MODULE}
      requiredPermissions={[CLIENTES_PERMISSIONS.CRIAR]}
    >
      <EntityPage
        actions={
          <EntityButton to="/app/clientes">
            Voltar para clientes
          </EntityButton>
        }
      >
        <ClienteForm
          mode="create"
          isSaving={isSaving}
          erro={erro}
          onSubmit={handleSubmit}
        />
      </EntityPage>
    </PageGuard>
  );
}
