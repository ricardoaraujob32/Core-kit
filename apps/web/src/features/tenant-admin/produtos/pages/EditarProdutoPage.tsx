// apps/web/src/features/tenant-admin/produtos/pages/EditarProdutoPage.tsx

import { Link, useNavigate, useParams } from "react-router-dom";
import { ProdutoForm } from "../components/ProdutoForm";
import { useProdutoDetails } from "../hooks/useProdutoDetails";
import { useSalvarProduto } from "../hooks/useSalvarProduto";
import type { AtualizarProdutoInput, CriarProdutoInput } from "../tipos";
import "./produtoPages.css";

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
    onSuccess: (produtoSalvo) =>
      navigate(`/app/produtos/${produtoSalvo.produtoId}`),
  });

  async function handleSubmit(
    input: CriarProdutoInput | AtualizarProdutoInput,
  ) {
    await salvar(input);
  }

  if (isLoading) {
    return (
      <div className="ck-product-page">
        <div className="ck-product-card">Carregando produto...</div>
      </div>
    );
  }

  if (erroCarga) {
    return (
      <div className="ck-product-page">
        <div className="ck-product-alert">{erroCarga}</div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="ck-product-page">
        <div className="ck-product-alert">Produto não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="ck-product-page">
      <div className="ck-product-page__actions">
        <Link className="ck-product-button" to={`/app/produtos/${produto.produtoId}`}>
          Voltar para detalhes
        </Link>

        <Link className="ck-product-button" to="/app/produtos">
          Lista de produtos
        </Link>
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
