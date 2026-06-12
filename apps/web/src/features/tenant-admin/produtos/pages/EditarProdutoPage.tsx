// apps/web/src/features/tenant-admin/produtos/pages/EditarProdutoPage.tsx

import { useNavigate, useParams } from "react-router-dom";
import { ProdutoForm } from "../components/ProdutoForm";
import { useProdutoDetails } from "../hooks/useProdutoDetails";
import { useSalvarProduto } from "../hooks/useSalvarProduto";
import type { AtualizarProdutoInput, CriarProdutoInput } from "../tipos";

export default function EditarProdutoPage() {
  const navigate = useNavigate();
  const params = useParams<{ produtoId: string }>();
  const produtoId = params.produtoId?.trim();

  const {
    produto,
    isLoading,
    erro: erroCarga,
  } = useProdutoDetails(produtoId);

  const { salvar, isSaving, erro } = useSalvarProduto({
    mode: "edit",
    produtoId,
    onSuccess: () =>
      navigate(produtoId ? `/app/produtos/${produtoId}` : "/app/produtos"),
  });

  async function handleSubmit(
    input: CriarProdutoInput | AtualizarProdutoInput,
  ) {
    await salvar(input);
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        Carregando produto...
      </div>
    );
  }

  if (erroCarga) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {erroCarga}
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Produto não encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar produto/serviço</h1>
        <p className="text-sm text-slate-600">
          Atualize os dados do produto ou serviço.
        </p>
      </div>

      <ProdutoForm
        mode="edit"
        initialData={produto}
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </div>
  );
}