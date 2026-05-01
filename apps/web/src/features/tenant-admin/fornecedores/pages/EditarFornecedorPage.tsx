// apps/web/src/features/tenant-admin/fornecedores/pages/EditarFornecedorPage.tsx

import { useNavigate, useParams } from "react-router-dom";
import { FornecedorForm } from "../components/FornecedorForm";
import { useFornecedorDetails } from "../hooks/useFornecedorDetails";
import { useSalvarFornecedor } from "../hooks/useSalvarFornecedor";
import type { AtualizarFornecedorInput, CriarFornecedorInput } from "../tipos";

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
    return <div className="rounded-2xl border bg-white p-6">Carregando fornecedor...</div>;
  }

  if (erroCarga) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroCarga}</div>;
  }

  if (!fornecedor) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Fornecedor não encontrado.</div>;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar fornecedor</h1>
        <p className="text-sm text-slate-600">
          Atualize os dados do fornecedor.
        </p>
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