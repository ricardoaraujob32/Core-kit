// apps/web/src/features/superadmin/locatarios/components/LocatariosTable.tsx

import { Link } from "react-router-dom";
import type { Locatario } from "../tipos";
import "../../shared/superAdminPages.css";

type Props = {
  itens: Locatario[];
};

function statusLabel(status?: string | null): string {
  return status ?? "—";
}

export function LocatariosTable({ itens }: Props) {
  if (itens.length === 0) {
    return (
      <div className="ck-superadmin-card">
        Nenhum locatário encontrado.
      </div>
    );
  }

  return (
    <div className="ck-superadmin-table-panel">
      <table className="ck-superadmin-table">
        <thead>
          <tr>
            <th>Locatário</th>
            <th>Slug</th>
            <th>Status</th>
            <th>ID técnico</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {itens.map((locatario) => (
            <tr key={locatario.locatarioId}>
              <td>{locatario.nome ?? "Sem nome"}</td>
              <td>{locatario.slug ?? "—"}</td>
              <td>{statusLabel(locatario.status)}</td>
              <td className="ck-superadmin-technical">
                {locatario.locatarioId}
              </td>
              <td>
                <div className="ck-superadmin-row-actions">
                  <Link
                    className="ck-superadmin-button"
                    to={`/plataforma/locatarios/${locatario.locatarioId}`}
                  >
                    Ver
                  </Link>

                  <Link
                    className="ck-superadmin-button"
                    to={`/plataforma/locatarios/${locatario.locatarioId}/editar`}
                  >
                    Editar
                  </Link>

                  <Link
                    className="ck-superadmin-button"
                    to={`/plataforma/locatarios/${locatario.locatarioId}/usuarios`}
                  >
                    Usuários
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
