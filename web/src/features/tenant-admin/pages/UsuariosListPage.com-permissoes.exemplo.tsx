import { useNavigate } from "react-router-dom";
import { UsuariosFilters } from "../components/UsuariosFilters";
import { UsuariosTable } from "../components/UsuariosTable";
import { UsuarioActionGuard } from "../components/UsuarioActionGuard";
import { useUsuarios } from "../hooks/useUsuarios";
import { useUsuarioActions } from "../hooks/useUsuarioActions";
import { useUsuariosPermissions } from "../hooks/useUsuariosPermissions";

export default function UsuariosListPage() {
  const navigate = useNavigate();
  const permissions = useUsuariosPermissions();
  const {
    usuariosFiltrados,
    isLoading,
    erro,
    filtro,
    setFiltro,
    recarregar,
  } = useUsuarios();

  const { inativar, reativar, erro: erroAcao } = useUsuarioActions({
    onSuccess: recarregar,
  });

  if (!permissions.canList) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Você não possui acesso ao módulo de usuários.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="text-sm text-slate-600">
            Gerencie os usuários do locatário autenticado.
          </p>
        </div>

        <UsuarioActionGuard action="criar">
          <button
            className="rounded-xl border px-4 py-2 font-medium"
            onClick={() => navigate("/tenant/usuarios/novo")}
          >
            Novo usuário
          </button>
        </UsuarioActionGuard>
      </div>

      <UsuariosFilters filtro={filtro} onChange={setFiltro} />

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      {erroAcao ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erroAcao}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6">Carregando usuários...</div>
      ) : (
        <UsuariosTable
          usuarios={usuariosFiltrados}
          onView={(usuarioId) => navigate(`/tenant/usuarios/${usuarioId}`)}
          onEdit={(usuarioId) => navigate(`/tenant/usuarios/${usuarioId}/editar`)}
          onInativar={(usuarioId) => void inativar(usuarioId)}
          onReativar={(usuarioId) => void reativar(usuarioId)}
        />
      )}
    </div>
  );
}
