// apps/web/src/features/tenant-admin/clientes/components/ClientesTable.tsx

import { Link } from "react-router-dom";
import type { Cliente } from "../tipos";

type Props = {
  itens: Cliente[];
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

export function ClientesTable({ itens }: Props) {
  if (itens.length === 0) {
    return (
      <div className="ck-register-empty">
        <div className="ck-register-empty-title">Nenhum cliente encontrado</div>
        <p className="ck-register-empty-desc">
          Cadastre clientes para agilizar novas vendas e manter histórico.
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
                <th>Cliente</th>
                <th>Documento</th>
                <th>Contato</th>
                <th>Cadastrado em</th>
                <th>Código</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {itens.map((cliente) => (
                <tr key={cliente.clienteId}>
                  <td>
                    <div className="ck-register-main">{cliente.nome}</div>
                    <div className="ck-register-sub">{cliente.email ?? "Sem e-mail"}</div>
                  </td>
                  <td>{cliente.documento ?? "—"}</td>
                  <td>{cliente.telefone ?? "—"}</td>
                  <td>{formatarData(cliente.criadoEm)}</td>
                  <td>
                    <span className="ck-register-pill">
                      #{codigoCurto(cliente.clienteId)}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="ck-register-link"
                      to={`/app/clientes/${cliente.clienteId}`}
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
        {itens.map((cliente) => (
          <article className="ck-register-card" key={cliente.clienteId}>
            <div className="ck-register-card-top">
              <div>
                <div className="ck-register-card-title">{cliente.nome}</div>
                <div className="ck-register-card-desc">
                  {cliente.documento ?? "Sem documento"}
                </div>
              </div>

              <span className="ck-register-pill">#{codigoCurto(cliente.clienteId)}</span>
            </div>

            <div className="ck-register-card-grid">
              <div>
                <div className="ck-register-label">E-mail</div>
                <div className="ck-register-value">{cliente.email ?? "—"}</div>
              </div>

              <div>
                <div className="ck-register-label">Telefone</div>
                <div className="ck-register-value">{cliente.telefone ?? "—"}</div>
              </div>
            </div>

            <Link
              className="ck-register-action-secondary"
              to={`/app/clientes/${cliente.clienteId}`}
            >
              Ver detalhes
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
