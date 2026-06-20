// apps/web/src/features/tenant-admin/produtos/pages/ProdutoDetailsPage.tsx

import { Link, useParams } from "react-router-dom";
import { formatDateTime, formatMoney } from "../../../../shared/formatters";
import { useProdutoDetails } from "../hooks/useProdutoDetails";
import { toProdutoViewModel } from "../produto.viewModel";
import "./produtoPages.css";

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

  if (isLoading) {
    return (
      <div className="ck-product-page">
        <div className="ck-product-card">Carregando produto...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="ck-product-page">
        <div className="ck-product-alert">{erro}</div>
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

  const vm = toProdutoViewModel({
    ...produto,
    status: produto.ativo === false ? "INATIVO" : "ATIVO",
  });

  return (
    <div className="ck-product-page">
      <section className="ck-product-detail-hero">
        <div>
          <p className="ck-product-kicker">Produto</p>
          <h1>{vm.titulo}</h1>
          <p>{[vm.subtitulo, vm.contexto].filter(Boolean).join(" — ")}</p>
        </div>

        <div className="ck-product-page__actions">
          <Link
            className="ck-product-button ck-product-button--primary"
            to={`/app/produtos/${produto.produtoId}/editar`}
          >
            Editar
          </Link>

          <Link className="ck-product-button" to="/app/produtos">
            Lista de produtos
          </Link>
        </div>
      </section>

      <section className="ck-product-detail-grid">
        <article className="ck-product-card">
          <div className="ck-product-card__title">
            <h2>Identificação</h2>
            <p>Dados principais do catálogo.</p>
          </div>

          <dl className="ck-product-detail-list">
            <div>
              <dt>Nome</dt>
              <dd>{produto.nome}</dd>
            </div>

            <div>
              <dt>SKU</dt>
              <dd>{produto.sku ?? "—"}</dd>
            </div>

            <div>
              <dt>Tipo</dt>
              <dd>{tipoLabel(produto.tipo)}</dd>
            </div>

            <div>
              <dt>Unidade</dt>
              <dd>{produto.unidade}</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>{statusLabel(produto.ativo)}</dd>
            </div>
          </dl>
        </article>

        <article className="ck-product-card">
          <div className="ck-product-card__title">
            <h2>Valores</h2>
            <p>Informações comerciais.</p>
          </div>

          <dl className="ck-product-detail-list">
            <div>
              <dt>Preço de venda</dt>
              <dd>{formatMoney(produto.precoVenda)}</dd>
            </div>

            <div>
              <dt>Custo de referência</dt>
              <dd>{formatMoney(produto.custoReferencia)}</dd>
            </div>
          </dl>
        </article>

        <article className="ck-product-card">
          <div className="ck-product-card__title">
            <h2>Registro</h2>
            <p>Datas de criação e atualização.</p>
          </div>

          <dl className="ck-product-detail-list">
            <div>
              <dt>Criado em</dt>
              <dd>{formatDateTime(produto.criadoEm)}</dd>
            </div>

            <div>
              <dt>Atualizado em</dt>
              <dd>{formatDateTime(produto.atualizadoEm)}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="ck-product-card">
        <div className="ck-product-card__title">
          <h2>Descrição</h2>
        </div>

        <p className="ck-product-description">
          {produto.descricao ?? "Nenhuma descrição cadastrada."}
        </p>
      </section>
    </div>
  );
}
