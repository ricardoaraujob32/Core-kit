// apps/web/src/features/tenant-admin/clientes/pages/NovoClientePage.tsx

import { Link, useNavigate } from "react-router-dom";
import { ClienteForm } from "../components/ClienteForm";
import { useSalvarCliente } from "../hooks/useSalvarCliente";
import type { AtualizarClienteInput, CriarClienteInput } from "../tipos";
import "../../shared/entityPages.css";

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
    <div className="ck-entity-page">
      <div className="ck-entity-page__actions">
        <Link className="ck-entity-button" to="/app/clientes">
          Voltar para clientes
        </Link>
      </div>

      <ClienteForm
        mode="create"
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
