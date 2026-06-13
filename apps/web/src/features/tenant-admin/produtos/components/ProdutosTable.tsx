// apps/web/src/features/tenant-admin/produtos/components/ProdutosTable.tsx

import { Link } from "react-router-dom";
import type { Produto } from "../tipos";

type Props = {
  itens: Produto[];
};

function formatarMoeda(valor?: number | null): string {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function codigoCurto(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function ProdutosTable({ itens }: Props) {
  if (itens.length === 0) {
    return (
      <div className="ck-register-empty">
        <div className="ck-register-empty-title">Nenhum produto encontrado</div>
        <p className="ck-register-empty-desc">
          Cadastre produtos e serviços para usar nas vendas e compras.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <div className="ck-register-table-panel">
          <table className="ck-register-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Tipo</th>
                <th>Unidade</th>
                <th>Preço venda</th>
                <th>Código</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {itens.map((produto) => (
                <tr key={produto.produtoId}>
                  <td>
                    <div className="ck-register-main">{produto.nome}</div>
                    <div className="ck-register-sub">{produto.descricao ?? "Sem descrição"}</div>
                  </td>
                  <td>{produto.sku ?? "—"}</td>
                  <td>{produto.tipo}</td>
                  <td>{produto.unidade ?? "—"}</td>
                  <td><strong>{formatarMoeda(produto.precoVenda)}</strong></td>
                  <td>
                    <span className="ck-register-pill">
                      #{codigoCurto(produto.produtoId)}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="ck-register-link"
                      to={`/app/produtos/${produto.produtoId}`}
                    >
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ck-register-card-list md:hidden">
        {itens.map((produto) => (
          <article className="ck-register-card" key={produto.produtoId}>
            <div className="ck-register-card-top">
              <div>
                <div className="ck-register-card-title">{produto.nome}</div>
                <div className="ck-register-card-desc">
                  {produto.sku ?? "Sem SKU"} • {produto.tipo}
                </div>
              </div>

              <span className="ck-register-pill">#{codigoCurto(produto.produtoId)}</span>
            </div>

            <div className="ck-register-card-grid">
              <div>
                <div className="ck-register-label">Unidade</div>
                <div className="ck-register-value">{produto.unidade ?? "—"}</div>
              </div>

              <div>
                <div className="ck-register-label">Preço venda</div>
                <div className="ck-register-value">{formatarMoeda(produto.precoVenda)}</div>
              </div>
            </div>

            <Link
              className="ck-register-action-secondary"
              to={`/app/produtos/${produto.produtoId}`}
            >
              Ver detalhes
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
