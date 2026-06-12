// apps/web/src/features/tenant-admin/usuarios/pages/usuarioDetailsPage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usuariosApi } from "../api/usuariosApi";
import { UsuarioActionGuard } from "../components/usuarioActionGuard";
import { UsuarioDetailsCard } from "../components/usuarioDetailsCard";
import { useUsuarioActions } from "../hooks/useUsuarioActions";
import { useUsuariosPermissions } from "../hooks/useUsuariosPermissions";
import type { RedefinirSenhaUsuarioInput, Usuario } from "../tipos";
import { useAuth } from "../../../../core/auth/useAuth";
import { useSenhaUsuario } from "../hooks/useSenhaUsuario";
import { UsuarioSenhaForm } from "../components/UsuarioSenhaForm";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { USUARIOS_MODULE, USUARIOS_PERMISSIONS } from "../../../../core/api/permissions";
import { useUsuarioDetails } from "../hooks/useUsuarioDetails";

// export default function UsuarioDetailsPage() {
//   const navigate = useNavigate();
//   const permissions = useUsuariosPermissions();
//   const { usuarioId = "" } = useParams<{ usuarioId: string }>();
//   const [usuario, setUsuario] = useState<Usuario | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [erroCarga, setErroCarga] = useState<string | null>(null);
//   const { user } = useAuth();

//   const {alterarMinhaSenha, redefinirSenha, erro: erroSenha, sucesso: sucessoSenha, isSaving: isSavingSenha} = useSenhaUsuario({
//     usuarioId,
//   });

//   const isProprioUsuario = Boolean(
//     usuarioId && user?.usuarioId && usuarioId === user.usuarioId,
//   );

//   async function carregar() {
//     setIsLoading(true);
//     setErroCarga(null);

//     try {
//       const response = await usuariosApi.obter(usuarioId);
//       setUsuario(response.item);
//     } catch {
//       setErroCarga("Não foi possível carregar o usuário.");
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   useEffect(() => {
//     void carregar();
//   }, [usuarioId]);

//   const { inativar, reativar, erro } = useUsuarioActions({
//     onSuccess: carregar,
//   });

//   if (!permissions.canList) {
//     return (
//       <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
//         Você não possui acesso ao módulo de usuários.
//       </div>
//     );
//   }

//   if (isLoading) {
//     return <div className="rounded-2xl border bg-white p-6">Carregando usuário...</div>;
//   }

//   if (erroCarga || !usuario) {
//     return (
//       <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//         {erroCarga ?? "Usuário não encontrado."}
//       </div>
//     );
//   }

//   return (
//     <div className="grid gap-6">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-semibold">{usuario.nome}</h1>
//           <p className="text-sm text-slate-600">{usuario.email}</p>
//         </div>

//         <div className="flex gap-2">
//           <UsuarioActionGuard action="editar">
//             <button
//               className="rounded-xl border px-4 py-2 font-medium"
//               onClick={() => navigate(`/app/usuarios/${usuario.usuarioId}/editar`)}
//             >
//               Editar
//             </button>
//           </UsuarioActionGuard>

//           {usuario.status === "ATIVO" ? (
//             <UsuarioActionGuard action="inativar" statusAtual={usuario.status}>
//               <button
//                 className="rounded-xl border px-4 py-2 font-medium"
//                 onClick={() => void inativar(usuario.usuarioId)}
//               >
//                 Inativar
//               </button>
//             </UsuarioActionGuard>
//           ) : (
//             <UsuarioActionGuard action="reativar" statusAtual={usuario.status}>
//               <button
//                 className="rounded-xl border px-4 py-2 font-medium"
//                 onClick={() => void reativar(usuario.usuarioId)}
//               >
//                 Reativar
//               </button>
//             </UsuarioActionGuard>
//           )}
//         </div>
//       </div>

//       {erro ? (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//           {erro}
//         </div>
//       ) : null}

//       <UsuarioDetailsCard usuario={usuario} />
//     </div>
//   );
// }

export default function UsuarioDetailsPage() {
  const params = useParams<{ usuarioId: string }>();
  const usuarioId = params.usuarioId?.trim();

  const { usuario, isLoading, erro } = useUsuarioDetails(usuarioId);

  const {
    redefinirSenha,
    erro: erroSenha,
    sucesso: sucessoSenha,
    isSaving: isSavingSenha,
  } = useSenhaUsuario({
    usuarioId,
  });

  async function handleRedefinirSenha(input: RedefinirSenhaUsuarioInput) {
    await redefinirSenha(input);
  }

  if (isLoading) {
    return <div className="rounded-2xl border bg-white p-6">Carregando usuário...</div>;
  }

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {erro}
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Usuário não encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{usuario.nome}</h1>
          <p className="text-sm text-slate-600">{usuario.email}</p>
        </div>

        <PageGuard
          requiredModule={USUARIOS_MODULE}
          requiredPermissions={[USUARIOS_PERMISSIONS.ATUALIZAR]}
          fallback={
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Você pode visualizar, mas não editar este usuário.
            </div>
          }
        >
          <Link
            className="rounded-xl border px-4 py-2"
            to={`/app/usuarios/${usuario.usuarioId}/editar`}
          >
            Editar
          </Link>
        </PageGuard>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-white p-6 text-sm">
        <div><strong>ID:</strong> {usuario.usuarioId}</div>
        <div><strong>Nome:</strong> {usuario.nome}</div>
        <div><strong>E-mail:</strong> {usuario.email}</div>
        <div><strong>Status:</strong> {usuario.status}</div>
        <div><strong>Último login:</strong> {usuario.ultimoLoginEm ?? "-"}</div>
        <div><strong>Criado em:</strong> {usuario.criadoEm}</div>
        <div><strong>Atualizado em:</strong> {usuario.atualizadoEm}</div>
      </div>

      <PageGuard
        requiredModule={USUARIOS_MODULE}
        requiredPermissions={[USUARIOS_PERMISSIONS.ATUALIZAR]}
        fallback={
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Você não possui permissão para redefinir senha.
          </div>
        }
      >
        <UsuarioSenhaForm
          mode="redefinir"
          isSaving={isSavingSenha}
          erro={erroSenha}
          sucesso={sucessoSenha}
          onSubmit={handleRedefinirSenha}
        />
      </PageGuard>
    </div>
  );
}
