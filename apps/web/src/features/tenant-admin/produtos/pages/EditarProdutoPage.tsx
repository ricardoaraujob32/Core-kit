// apps/web/src/features/tenant-admin/produtos/pages/EditarProdutoPage.tsx

import { useNavigate, useParams } from "react-router-dom";
import {
  PRODUTOS_MODULE,
  PRODUTOS_PERMISSIONS,
} from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";
import {
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityPage,
} from "../../shared/entity-ui";
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
      <EntityPage>
        <EntityCard>Carregando produto...</EntityCard>
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

  if (!produto) {
    return (
      <EntityPage>
        <EntityAlert>Produto não encontrado.</EntityAlert>
      </EntityPage>
    );
  }

  return (
    <PageGuard
      requiredModule={PRODUTOS_MODULE}
      requiredPermissions={[PRODUTOS_PERMISSIONS.ATUALIZAR]}
    >
      <EntityPage
        actions={
          <>
            <EntityButton to={`/app/produtos/${produto.produtoId}`}>
              Voltar para detalhes
            </EntityButton>

            <EntityButton to="/app/produtos">
              Lista de produtos
            </EntityButton>
          </>
        }
      >
        <ProdutoForm
          mode="edit"
          initialData={produto}
          isSaving={isSaving}
          erro={erro}
          onSubmit={handleSubmit}
        />
      </EntityPage>
    </PageGuard>
  );
}
