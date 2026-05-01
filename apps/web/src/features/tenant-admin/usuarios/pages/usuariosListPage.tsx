// apps/web/src/features/tenant-admin/usuarios/pages/usuariosListPage.tsx

import { Link, useNavigate } from "react-router-dom";
import { UsuariosFilters } from "../components/usuariosFilters";
import { UsuariosTable } from "../components/usuariosTable";
import { UsuarioActionGuard } from "../components/usuarioActionGuard";
import { useUsuarios } from "../hooks/useUsuarios";
import { useUsuarioActions } from "../hooks/useUsuarioActions";
import { useUsuariosPermissions } from "../hooks/useUsuariosPermissions";
import { USUARIOS_MODULE, USUARIOS_PERMISSIONS } from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";

// export default function UsuariosListPage() {
//   const navigate = useNavigate();
//   const permissions = useUsuariosPermissions();
//   const {
//     usuariosFiltrados,
//     isLoading,
//     erro,
//     filtro,
//     setFiltro,
//     recarregar,
//   } = useUsuarios();

//   const { inativar, reativar, erro: erroAcao } = useUsuarioActions({
//     onSuccess: recarregar,
//   });

//   if (!permissions.canList) {
//     return (
//       <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
//         Você não possui acesso ao módulo de usuários.
//       </div>
//     );
//   }

//   return (
//     <div className="grid gap-6">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-semibold">Usuários</h1>
//           <p className="text-sm text-slate-600">
//             Gerencie os usuários do locatário autenticado.
//           </p>
//         </div>

//         <UsuarioActionGuard action="criar">
//           <button
//             className="rounded-xl border px-4 py-2 font-medium"
//             onClick={() => navigate("/app/usuarios/novo")}
//           >
//             Novo usuário
//           </button>
//         </UsuarioActionGuard>
//       </div>

//       <UsuariosFilters filtro={filtro} onChange={setFiltro} />

//       {erro ? (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//           {erro}
//         </div>
//       ) : null}

//       {erroAcao ? (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//           {erroAcao}
//         </div>
//       ) : null}

//       {isLoading ? (
//         <div className="rounded-2xl border bg-white p-6">Carregando usuários...</div>
//       ) : (
//         <UsuariosTable
//           usuarios={usuariosFiltrados}
//           onView={(usuarioId) => navigate(`/app/usuarios/${usuarioId}`)}
//           onEdit={(usuarioId) => navigate(`/app/usuarios/${usuarioId}/editar`)}
//           onInativar={(usuarioId) => void inativar(usuarioId)}
//           onReativar={(usuarioId) => void reativar(usuarioId)}
//         />
//       )}
//     </div>
//   );
// }

export default function UsuariosListPage() {
  const { usuariosFiltrados, isLoading, erro, recarregar } = useUsuarios();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="text-sm text-slate-600">
            Gerencie os usuários do locatário.
          </p>
        </div>

        <PageGuard
          requiredModule={USUARIOS_MODULE}
          requiredPermissions={[USUARIOS_PERMISSIONS.CRIAR]}
          fallback={
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Você não possui permissão para criar usuários.
            </div>
          }
        >
          <Link
            className="rounded-xl border px-4 py-2"
            to="/app/usuarios/novo"
          >
            Novo usuário
          </Link>
        </PageGuard>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          className="rounded-xl border px-4 py-2"
          type="button"
          onClick={() => void recarregar()}
        >
          Recarregar
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6">Carregando usuários...</div>
      ) : (
        <UsuariosTable itens={usuariosFiltrados} />
      )}
    </div>
  );
}