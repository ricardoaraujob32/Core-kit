// apps/web/src/features/tenant-admin/clientes/pages/EditarClientePage.tsx

import { Link, useNavigate, useParams } from "react-router-dom";
import { ClienteForm } from "../components/ClienteForm";
import { useClienteDetails } from "../hooks/useClienteDetails";
import { useSalvarCliente } from "../hooks/useSalvarCliente";
import type { AtualizarClienteInput, CriarClienteInput } from "../tipos";
import "../../shared/entityPages.css";

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
      <div className="ck-entity-page">
        <div className="ck-entity-card">Carregando cliente...</div>
      </div>
    );
  }

  if (erroCarga) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-alert">{erroCarga}</div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-alert">Cliente não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="ck-entity-page">
      <div className="ck-entity-page__actions">
        <Link className="ck-entity-button" to={`/app/clientes/${cliente.clienteId}`}>
          Voltar para detalhes
        </Link>

        <Link className="ck-entity-button" to="/app/clientes">
          Lista de clientes
        </Link>
      </div>

      <ClienteForm
        mode="edit"
        initialData={cliente}
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
