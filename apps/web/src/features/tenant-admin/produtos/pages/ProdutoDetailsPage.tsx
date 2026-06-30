// apps/web/src/features/tenant-admin/produtos/pages/ProdutoDetailsPage.tsx

import { useParams } from "react-router-dom";
import {
  PRODUTOS_MODULE,
  PRODUTOS_PERMISSIONS,
} from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { formatDateTime, formatMoney } from "../../../../shared/formatters";
import {
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityDetailGrid,
  EntityDetailList,
  EntityHero,
  EntityPage,
} from "../../shared/entity-ui";
import { useProdutoDetails } from "../hooks/useProdutoDetails";
import { useProdutosPermissions } from "../hooks/useProdutosPermissions";
import { toProdutoViewModel } from "../produto.viewModel";

function statusLabel(ativo?: boolean): string {
  return ativo === false ? "Inativo" : "Ativo";
}

function tipoLabel(tipo: string): string {
  return tipo === "SERVICO" ? "Serviço" : "Produto";
}

export default function ProdutoDetailsPage() {
  const params = useParams<{ produtoId: string }>();
  const produtoId = params.produtoId?.trim();

  const { produto, isLoading, erro } = useProdutoDetails(produtoId);
  const permissions = useProdutosPermissions();

  if (isLoading) {
    return (
      <EntityPage>
        <EntityCard>Carregando produto...</EntityCard>
      </EntityPage>
    );
  }

  if (erro) {
    return (
      <EntityPage>
        <EntityAlert>{erro}</EntityAlert>
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

  const vm = toProdutoViewModel({
    ...produto,
    status: produto.ativo === false ? "INATIVO" : "ATIVO",
  });

  return (
    <PageGuard
      requiredModule={PRODUTOS_MODULE}
      requiredPermissions={[PRODUTOS_PERMISSIONS.LISTAR]}
    >
      <EntityPage>
        <EntityHero
          kicker="Produto"
          title={vm.titulo}
          description={[vm.subtitulo, vm.contexto].filter(Boolean).join(" — ")}
          actions={
            <>
              {permissions.canEdit ? (
                <EntityButton
                  to={`/app/produtos/${produto.produtoId}/editar`}
                  variant="primary"
                >
                  Editar
                </EntityButton>
              ) : null}

              <EntityButton to="/app/produtos">
                Lista de produtos
              </EntityButton>
            </>
          }
        />

      <EntityDetailGrid columns={3}>
        <EntityCard title="Identificação" description="Dados principais do catálogo.">
          <EntityDetailList
            items={[
              { label: "Nome", value: produto.nome },
              { label: "SKU", value: produto.sku },
              { label: "Tipo", value: tipoLabel(produto.tipo) },
              { label: "Unidade", value: produto.unidade },
              { label: "Status", value: statusLabel(produto.ativo) },
            ]}
          />
        </EntityCard>

        <EntityCard title="Valores" description="Informações comerciais.">
          <EntityDetailList
            items={[
              { label: "Preço de venda", value: formatMoney(produto.precoVenda) },
              {
                label: "Custo de referência",
                value: formatMoney(produto.custoReferencia),
              },
            ]}
          />
        </EntityCard>

        <EntityCard title="Registro" description="Datas de criação e atualização.">
          <EntityDetailList
            items={[
              { label: "Criado em", value: formatDateTime(produto.criadoEm) },
              {
                label: "Atualizado em",
                value: formatDateTime(produto.atualizadoEm),
              },
            ]}
          />
        </EntityCard>
        </EntityDetailGrid>

        <EntityCard title="Descrição">
          <p className="ck-entity-description">
            {produto.descricao ?? "Nenhuma descrição cadastrada."}
          </p>
        </EntityCard>
      </EntityPage>
    </PageGuard>
  );
}
