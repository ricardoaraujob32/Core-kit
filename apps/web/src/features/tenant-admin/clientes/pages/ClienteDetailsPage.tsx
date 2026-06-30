// apps/web/src/features/tenant-admin/clientes/pages/ClienteDetailsPage.tsx

import { useParams } from "react-router-dom";
import {
  CLIENTES_MODULE,
  CLIENTES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { formatDateTime } from "../../../../shared/formatters";
import {
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityDetailGrid,
  EntityDetailList,
  EntityHero,
  EntityPage,
} from "../../shared/entity-ui";
import { useClienteDetails } from "../hooks/useClienteDetails";
import { useClientesPermissions } from "../hooks/useClientesPermissions";

export default function ClienteDetailsPage() {
  const params = useParams<{ clienteId: string }>();
  const clienteId = params.clienteId?.trim();

  const { cliente, isLoading, erro } = useClienteDetails(clienteId);
  const permissions = useClientesPermissions();

  if (isLoading) {
    return (
      <EntityPage>
        <EntityCard>Carregando cliente...</EntityCard>
      </EntityPage>
    );
  }

  if (erro) {
    return (
      <EntityPage>
        <EntityAlert>{erro}</EntityAlert>
      </EntityPage>
    );
  }

  if (!cliente) {
    return (
      <EntityPage>
        <EntityAlert>Cliente não encontrado.</EntityAlert>
      </EntityPage>
    );
  }

  return (
    <PageGuard
      requiredModule={CLIENTES_MODULE}
      requiredPermissions={[CLIENTES_PERMISSIONS.LISTAR]}
    >
      <EntityPage>
        <EntityHero
          kicker="Cliente"
          title={cliente.nome}
          description={cliente.documento ?? "Documento não informado"}
          actions={
            <>
              {permissions.canEdit ? (
                <EntityButton
                  to={`/app/clientes/${cliente.clienteId}/editar`}
                  variant="primary"
                >
                  Editar
                </EntityButton>
              ) : null}

              <EntityButton to="/app/clientes">
                Lista de clientes
              </EntityButton>
            </>
          }
        />

        <EntityDetailGrid>
          <EntityCard title="Identificação" description="Dados principais do cliente.">
            <EntityDetailList
              items={[
                { label: "Nome", value: cliente.nome },
                { label: "Documento", value: cliente.documento },
              ]}
            />
          </EntityCard>

          <EntityCard title="Contato" description="Canais de comunicação.">
            <EntityDetailList
              items={[
                { label: "E-mail", value: cliente.email },
                { label: "Telefone", value: cliente.telefone },
              ]}
            />
          </EntityCard>
        </EntityDetailGrid>

        <EntityCard title="Registro">
          <EntityDetailList
            items={[
              { label: "Criado em", value: formatDateTime(cliente.criadoEm) },
              {
                label: "Atualizado em",
                value: formatDateTime(cliente.atualizadoEm),
              },
            ]}
          />
        </EntityCard>
      </EntityPage>
    </PageGuard>
  );
}
