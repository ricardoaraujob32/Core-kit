// apps/web/src/features/tenant-admin/fornecedores/pages/NovoFornecedorPage.tsx

import { Link, useNavigate } from "react-router-dom";
import { FornecedorForm } from "../components/FornecedorForm";
import { useSalvarFornecedor } from "../hooks/useSalvarFornecedor";
import type { AtualizarFornecedorInput, CriarFornecedorInput } from "../tipos";
import "../../shared/entityPages.css";

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
    <div className="ck-entity-page">
      <div className="ck-entity-page__actions">
        <Link className="ck-entity-button" to="/app/fornecedores">
          Voltar para fornecedores
        </Link>
      </div>

      <FornecedorForm
        mode="create"
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
