// apps/web/src/features/tenant-admin/fornecedores/components/FornecedoresTable.tsx

import { Link } from "react-router-dom";
import type { Fornecedor } from "../tipos";

type Props = {
  itens: Fornecedor[];
};

function formatarData(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function codigoCurto(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function FornecedoresTable({ itens }: Props) {
  if (itens.length === 0) {
    return (
      <div className="ck-register-empty">
        <div className="ck-register-empty-title">Nenhum fornecedor encontrado</div>
        <p className="ck-register-empty-desc">
          Cadastre fornecedores para organizar compras e reposições.
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
                <th>Fornecedor</th>
                <th>Documento</th>
                <th>Contato</th>
                <th>Cadastrado em</th>
                <th>Código</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {itens.map((fornecedor) => (
                <tr key={fornecedor.fornecedorId}>
                  <td>
                    <div className="ck-register-main">{fornecedor.nome}</div>
                    <div className="ck-register-sub">{fornecedor.email ?? "Sem e-mail"}</div>
                  </td>
                  <td>{fornecedor.documento ?? "—"}</td>
                  <td>{fornecedor.telefone ?? "—"}</td>
                  <td>{formatarData(fornecedor.criadoEm)}</td>
                  <td>
                    <span className="ck-register-pill">
                      #{codigoCurto(fornecedor.fornecedorId)}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="ck-register-link"
                      to={`/app/fornecedores/${fornecedor.fornecedorId}`}
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
        {itens.map((fornecedor) => (
          <article className="ck-register-card" key={fornecedor.fornecedorId}>
            <div className="ck-register-card-top">
              <div>
                <div className="ck-register-card-title">{fornecedor.nome}</div>
                <div className="ck-register-card-desc">
                  {fornecedor.documento ?? "Sem documento"}
                </div>
              </div>

              <span className="ck-register-pill">#{codigoCurto(fornecedor.fornecedorId)}</span>
            </div>

            <div className="ck-register-card-grid">
              <div>
                <div className="ck-register-label">E-mail</div>
                <div className="ck-register-value">{fornecedor.email ?? "—"}</div>
              </div>

              <div>
                <div className="ck-register-label">Telefone</div>
                <div className="ck-register-value">{fornecedor.telefone ?? "—"}</div>
              </div>
            </div>

            <Link
              className="ck-register-action-secondary"
              to={`/app/fornecedores/${fornecedor.fornecedorId}`}
            >
              Ver detalhes
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
