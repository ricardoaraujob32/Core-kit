// apps/web/src/features/tenant-admin/ordens-servico/pages/NovaOrdemServicoPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ORDENS_SERVICO_MODULE,
  ORDENS_SERVICO_PERMISSIONS,
} from "../../../../core/api/permissions";
import { mapError } from "../../../../core/errors/mapError";
import { PageGuard } from "../../../../core/routing/pageGuard";
import {
  EntityAlert,
  EntityButton,
  EntityHero,
  EntityPage,
} from "../../shared/entity-ui";
import { ordensServicoApi } from "../api/ordensServicoApi";
import { OrdemServicoForm } from "../components/OrdemServicoForm";
import type { CriarOrdemServicoInput } from "../tipos";

export default function NovaOrdemServicoPage() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  async function criar(input: CriarOrdemServicoInput) {
    setErro(null);

    try {
      const response = await ordensServicoApi.criar(input);
      navigate(`/app/ordens-servico/${response.item.ordemServicoId}`);
    } catch (error) {
      setErro(mapError(error).message);
    }
  }

  return (
    <PageGuard
      requiredModule={ORDENS_SERVICO_MODULE}
      requiredPermissions={[ORDENS_SERVICO_PERMISSIONS.CRIAR]}
    >
      <EntityPage
        actions={
          <EntityButton to="/app/ordens-servico">
            Voltar para ordens
          </EntityButton>
        }
      >
        <EntityHero
          kicker="Ordens de serviço"
          title="Nova OS"
          description="Registre uma ordem de serviço usando cliente, título e descrição. A data e o horário serão usados como referência principal."
        />

        {erro ? <EntityAlert>{erro}</EntityAlert> : null}

        <OrdemServicoForm onSubmit={criar} />
      </EntityPage>
    </PageGuard>
  );
}
