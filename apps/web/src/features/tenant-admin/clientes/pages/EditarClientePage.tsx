// apps/web/src/features/tenant-admin/clientes/pages/EditarClientePage.tsx

import { useNavigate, useParams } from "react-router-dom";
import {
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityPage,
} from "../../shared/entity-ui";
import { ClienteForm } from "../components/ClienteForm";
import { useClienteDetails } from "../hooks/useClienteDetails";
import { useSalvarCliente } from "../hooks/useSalvarCliente";
import type { AtualizarClienteInput, CriarClienteInput } from "../tipos";

export default function EditarClientePage() {
  const navigate = useNavigate();
  const params = useParams<{ clienteId: string }>();
  const clienteId = params.clienteId?.trim();

  const { cliente, isLoading, erro: erroCarga } = useClienteDetails(clienteId);

  const { salvar, isSaving, erro } = useSalvarCliente({
    mode: "edit",
    clienteId,
    onSuccess: () =>
      navigate(clienteId ? `/app/clientes/${clienteId}` : "/app/clientes"),
  });

  async function handleSubmit(input: CriarClienteInput | AtualizarClienteInput) {
    await salvar(input);
  }

  if (isLoading) {
    return (
      <EntityPage>
        <EntityCard>Carregando cliente...</EntityCard>
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

  if (!cliente) {
    return (
      <EntityPage>
        <EntityAlert>Cliente não encontrado.</EntityAlert>
      </EntityPage>
    );
  }

  return (
    <EntityPage
      actions={
        <>
          <EntityButton to={`/app/clientes/${cliente.clienteId}`}>
            Voltar para detalhes
          </EntityButton>

          <EntityButton to="/app/clientes">
            Lista de clientes
          </EntityButton>
        </>
      }
    >
      <ClienteForm
        mode="edit"
        initialData={cliente}
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </EntityPage>
  );
}
