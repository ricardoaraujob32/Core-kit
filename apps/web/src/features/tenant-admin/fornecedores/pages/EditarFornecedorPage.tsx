// apps/web/src/features/tenant-admin/fornecedores/pages/EditarFornecedorPage.tsx

import { Link, useNavigate, useParams } from "react-router-dom";
import { FornecedorForm } from "../components/FornecedorForm";
import { useFornecedorDetails } from "../hooks/useFornecedorDetails";
import { useSalvarFornecedor } from "../hooks/useSalvarFornecedor";
import type { AtualizarFornecedorInput, CriarFornecedorInput } from "../tipos";
import "../../shared/entityPages.css";

export default function EditarFornecedorPage() {
  const navigate = useNavigate();
  const params = useParams<{ fornecedorId: string }>();
  const fornecedorId = params.fornecedorId?.trim();

  const {
    fornecedor,
    isLoading,
    erro: erroCarga,
  } = useFornecedorDetails(fornecedorId);

  const { salvar, isSaving, erro } = useSalvarFornecedor({
    mode: "edit",
    fornecedorId,
    onSuccess: () =>
      navigate(
        fornecedorId
          ? `/app/fornecedores/${fornecedorId}`
          : "/app/fornecedores",
      ),
  });

  async function handleSubmit(
    input: CriarFornecedorInput | AtualizarFornecedorInput,
  ) {
    await salvar(input);
  }

  if (isLoading) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-card">Carregando fornecedor...</div>
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

  if (!fornecedor) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-alert">Fornecedor não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="ck-entity-page">
      <div className="ck-entity-page__actions">
        <Link className="ck-entity-button" to={`/app/fornecedores/${fornecedor.fornecedorId}`}>
          Voltar para detalhes
        </Link>

        <Link className="ck-entity-button" to="/app/fornecedores">
          Lista de fornecedores
        </Link>
      </div>

      <FornecedorForm
        mode="edit"
        initialData={fornecedor}
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
