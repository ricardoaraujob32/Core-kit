// apps/web/src/features/tenant-admin/clientes/pages/ClienteDetailsPage.tsx

import { useParams } from "react-router-dom";
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

export default function ClienteDetailsPage() {
  const params = useParams<{ clienteId: string }>();
  const clienteId = params.clienteId?.trim();

  const { cliente, isLoading, erro } = useClienteDetails(clienteId);

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
    <EntityPage>
      <EntityHero
        kicker="Cliente"
        title={cliente.nome}
        description={cliente.documento ?? "Documento não informado"}
        actions={
          <>
            <EntityButton
              to={`/app/clientes/${cliente.clienteId}/editar`}
              variant="primary"
            >
              Editar
            </EntityButton>

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
  );
}
