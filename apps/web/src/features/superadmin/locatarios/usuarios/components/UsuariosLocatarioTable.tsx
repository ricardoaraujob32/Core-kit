// apps/web/src/features/superadmin/locatarios/usuarios/components/UsuariosLocatarioTable.tsx

import { Link } from "react-router-dom";
import "../../../shared/superAdminPages.css";

export type UsuarioLocatarioResumo = {
  usuarioId: string;
  nome?: string | null;
  email?: string | null;
  ativo?: boolean | null;
};

type Props = {
  itens: UsuarioLocatarioResumo[];
  locatarioId: string;
};

function statusLabel(ativo?: boolean | null): string {
  return ativo === false ? "Inativo" : "Ativo";
}

export function UsuariosLocatarioTable({
  itens,
  locatarioId,
}: Props) {
  if (itens.length === 0) {
    return (
      <div className="ck-superadmin-card">
        Nenhum usuário encontrado para este locatário.
      </div>
    );
  }

  return (
    <div className="ck-superadmin-table-panel">
      <table className="ck-superadmin-table">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>E-mail</th>
            <th>Status</th>
            <th>ID técnico</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {itens.map((usuario) => (
            <tr key={usuario.usuarioId}>
              <td>{usuario.nome ?? "Sem nome"}</td>
              <td>{usuario.email ?? "—"}</td>
              <td>{statusLabel(usuario.ativo)}</td>
              <td className="ck-superadmin-technical">
                {usuario.usuarioId}
              </td>
              <td>
                <div className="ck-superadmin-row-actions">
                  <Link
                    className="ck-superadmin-button"
                    to={`/plataforma/locatarios/${locatarioId}/usuarios/${usuario.usuarioId}`}
                  >
                    Ver
                  </Link>

                  <Link
                    className="ck-superadmin-button"
                    to={`/plataforma/locatarios/${locatarioId}/usuarios/${usuario.usuarioId}/editar`}
                  >
                    Editar
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
