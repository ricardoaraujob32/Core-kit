// apps/web/src/features/tenant-admin/produtos/pages/ProdutosListPage.tsx

import { Link } from "react-router-dom";
import {
  PRODUTOS_MODULE,
  PRODUTOS_PERMISSIONS,
} from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { ProdutosTable } from "../components/ProdutosTable";
import { useProdutos } from "../hooks/useProdutos";
import { useProdutosPermissions } from "../hooks/useProdutosPermissions";
import type { Produto } from "../tipos";
import "../../cadastros/cadastros.css";
import { toProdutoViewModel } from "../produto.viewModel";

function contarSemPreco(itens: Produto[]): number {
  return itens.filter((item) => Number(item.precoVenda ?? 0) <= 0).length;
}

function contarComSku(itens: Produto[]): number {
  return itens.filter((item) => Boolean(item.sku?.trim())).length;
}

export default function ProdutosListPage() {
  const { produtos, busca, setBusca, isLoading, erro, recarregar } = useProdutos();
  const permissions = useProdutosPermissions();

  return (
    <div className="ck-register-page">
      <section className="ck-register-hero">
        <div className="ck-register-hero-inner">
          <div>
            <div className="ck-register-kicker">Catálogo</div>
            <h1 className="ck-register-title">Produtos</h1>
            <p className="ck-register-description">
              Cadastre produtos e serviços com SKU, unidade, preço de venda e
              custo de referência.
            </p>
          </div>

          <div className="ck-register-actions">
            <PageGuard
              requiredModule={PRODUTOS_MODULE}
              requiredPermissions={[PRODUTOS_PERMISSIONS.CRIAR]}
            >
              <Link className="ck-register-action-primary" to="/app/produtos/novo">
                Novo produto
              </Link>
            </PageGuard>
          </div>
        </div>
      </section>

      {!permissions.canList ? (
        <div className="ck-register-alert">
          Você não possui permissão para acessar produtos.
        </div>
      ) : null}

      <section className="ck-register-stats">
        <article className="ck-register-stat" style={{ "--stat-color": "#f97316" } as React.CSSProperties}>
          <div className="ck-register-stat-row">
            <div>
              <div className="ck-register-stat-label">Produtos</div>
              <div className="ck-register-stat-value">{produtos.length}</div>
              <div className="ck-register-stat-hint">Total no catálogo</div>
            </div>
            <div className="ck-register-stat-icon">📦</div>
          </div>
        </article>

        <article className="ck-register-stat" style={{ "--stat-color": "#2563eb" } as React.CSSProperties}>
          <div className="ck-register-stat-row">
            <div>
              <div className="ck-register-stat-label">Com SKU</div>
              <div className="ck-register-stat-value">{contarComSku(produtos)}</div>
              <div className="ck-register-stat-hint">Identificação comercial</div>
            </div>
            <div className="ck-register-stat-icon">🏷️</div>
          </div>
        </article>

        <article className="ck-register-stat" style={{ "--stat-color": "#dc2626" } as React.CSSProperties}>
          <div className="ck-register-stat-row">
            <div>
              <div className="ck-register-stat-label">Sem preço</div>
              <div className="ck-register-stat-value">{contarSemPreco(produtos)}</div>
              <div className="ck-register-stat-hint">Revisar antes de vender</div>
            </div>
            <div className="ck-register-stat-icon">⚠️</div>
          </div>
        </article>
      </section>

      <section className="ck-register-filter">
        <div className="ck-register-filter-grid">
          <input
            className="ck-register-input"
            placeholder="Buscar por nome, SKU, descrição ou tipo"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />

          <button
            className="ck-register-button"
            type="button"
            onClick={() => void recarregar()}
          >
            Recarregar
          </button>
        </div>
      </section>

      {erro ? <div className="ck-register-alert">{erro}</div> : null}

      {permissions.canList && isLoading ? (
        <div className="ck-register-filter">Carregando produtos...</div>
      ) : permissions.canList ? (
        <ProdutosTable itens={produtos} />
      ) : null}
    </div>
  );
}
