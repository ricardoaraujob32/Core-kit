// apps/web/src/features/tenant-admin/ordens-servico/pages/NovaOrdemServicoPage.tsx

import { useNavigate } from "react-router-dom";
import {
  ORDENS_SERVICO_MODULE,
  ORDENS_SERVICO_PERMISSIONS,
} from "../../../../core/api/permissions";
import { useAuth } from "../../../../core/auth/useAuth";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { OfflineSyncStatus } from "../../../../shared/pwa/OfflineSyncStatus";
import {
  EntityAlert,
  EntityButton,
  EntityPage,
} from "../../shared/entity-ui";
import { OrdemServicoForm } from "../components/OrdemServicoForm";
import { useCreateOrdemServicoPwa } from "../hooks/useCreateOrdemServicoPwa";
import type { CriarOrdemServicoInput } from "../tipos";

export default function NovaOrdemServicoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createOs = useCreateOrdemServicoPwa();

  async function handleSubmit(input: CriarOrdemServicoInput) {
    const ordemServico = await createOs.criar(input);

    if (!ordemServico) return;

    if (createOs.isOffline) {
      navigate("/app/ordens-servico");
      return;
    }

    navigate(`/app/ordens-servico/${ordemServico.ordemServicoId}`);
  }

  return (
    <PageGuard
      requiredModule={ORDENS_SERVICO_MODULE}
      requiredPermissions={[ORDENS_SERVICO_PERMISSIONS.CRIAR]}
    >
      <EntityPage
        actions={
          <EntityButton to="/app/ordens-servico">
            Voltar para OS
          </EntityButton>
        }
      >
        <OfflineSyncStatus />

        {createOs.error ? (
          <EntityAlert>{createOs.error}</EntityAlert>
        ) : null}

        {createOs.isOffline ? (
          <EntityAlert>
            Você está offline. A OS será salva como pendente e sincronizada quando a conexão voltar.
          </EntityAlert>
        ) : null}

        {!user?.usuarioId ? (
          <EntityAlert>
            Não foi possível identificar o usuário autenticado.
          </EntityAlert>
        ) : (
          <OrdemServicoForm
            usuarioId={user.usuarioId}
            onSubmit={handleSubmit}
          />
        )}
      </EntityPage>
    </PageGuard>
  );
}
