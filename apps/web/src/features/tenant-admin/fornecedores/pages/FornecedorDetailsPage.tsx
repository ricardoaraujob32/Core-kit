// apps/web/src/features/tenant-admin/fornecedores/pages/FornecedorDetailsPage.tsx

import { useParams } from "react-router-dom";
import {
  FORNECEDORES_MODULE,
  FORNECEDORES_PERMISSIONS,
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
import { useFornecedorDetails } from "../hooks/useFornecedorDetails";
import { useFornecedoresPermissions } from "../hooks/useFornecedoresPermissions";

export default function FornecedorDetailsPage() {
  const params = useParams<{ fornecedorId: string }>();
  const fornecedorId = params.fornecedorId?.trim();

  const { fornecedor, isLoading, erro } = useFornecedorDetails(fornecedorId);
  const permissions = useFornecedoresPermissions();

  if (isLoading) {
    return (
      <EntityPage>
        <EntityCard>Carregando fornecedor...</EntityCard>
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
      requiredPermissions={[FORNECEDORES_PERMISSIONS.LISTAR]}
    >
      <EntityPage>
        <EntityHero
          kicker="Fornecedor"
          title={fornecedor.nome}
          description={fornecedor.documento ?? "Documento não informado"}
          actions={
            <>
              {permissions.canEdit ? (
                <EntityButton
                  to={`/app/fornecedores/${fornecedor.fornecedorId}/editar`}
                  variant="primary"
                >
                  Editar
                </EntityButton>
              ) : null}

              <EntityButton to="/app/fornecedores">
                Lista de fornecedores
              </EntityButton>
            </>
          }
        />

        <EntityDetailGrid>
          <EntityCard
            title="Identificação"
            description="Dados principais do fornecedor."
          >
            <EntityDetailList
              items={[
                { label: "Nome", value: fornecedor.nome },
                { label: "Documento", value: fornecedor.documento },
              ]}
            />
          </EntityCard>

          <EntityCard title="Contato" description="Canais de comunicação.">
            <EntityDetailList
              items={[
                { label: "E-mail", value: fornecedor.email },
                { label: "Telefone", value: fornecedor.telefone },
              ]}
            />
          </EntityCard>
        </EntityDetailGrid>

        <EntityCard title="Registro">
          <EntityDetailList
            items={[
              { label: "Criado em", value: formatDateTime(fornecedor.criadoEm) },
              {
                label: "Atualizado em",
                value: formatDateTime(fornecedor.atualizadoEm),
              },
            ]}
          />
        </EntityCard>
      </EntityPage>
    </PageGuard>
  );
}
