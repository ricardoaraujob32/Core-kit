// apps/web/src/features/tenant-admin/produtos/pages/NovoProdutoPage.tsx

import { useNavigate } from "react-router-dom";
import { EntityButton, EntityPage } from "../../shared/entity-ui";
import { ProdutoForm } from "../components/ProdutoForm";
import { useSalvarProduto } from "../hooks/useSalvarProduto";
import type { AtualizarProdutoInput, CriarProdutoInput } from "../tipos";

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
    <EntityPage
      actions={
        <EntityButton to="/app/produtos">
          Voltar para produtos
        </EntityButton>
      }
    >
      <ProdutoForm
        mode="create"
        isSaving={isSaving}
        erro={erro}
        onSubmit={handleSubmit}
      />
    </EntityPage>
  );
}
