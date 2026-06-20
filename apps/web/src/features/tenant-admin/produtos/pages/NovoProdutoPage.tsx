// apps/web/src/features/tenant-admin/produtos/pages/NovoProdutoPage.tsx

import { Link, useNavigate } from "react-router-dom";
import { ProdutoForm } from "../components/ProdutoForm";
import { useSalvarProduto } from "../hooks/useSalvarProduto";
import type { AtualizarProdutoInput, CriarProdutoInput } from "../tipos";
import "./produtoPages.css";

export default function NovoProdutoPage() {
  const navigate = useNavigate();

  const { salvar, isSaving, erro } = useSalvarProduto({
    mode: "create",
    onSuccess: (produto) => navigate(`/app/produtos/${produto.produtoId}`),
  });

  async function handleSubmit(
    input: CriarProdutoInput | AtualizarProdutoInput,
  ) {
    await salvar(input);
  }

  return (
    <div className="ck-product-page">
      <div className="ck-product-page__actions">
        <Link className="ck-product-button" to="/app/produtos">
          Voltar para produtos
        </Link>
      </div>

      <ProdutoForm
        mode="create"
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
