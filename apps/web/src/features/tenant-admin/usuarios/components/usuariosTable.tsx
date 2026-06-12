// apps/web/src/features/tenant-admin/usuarios/components/usuariosTable.tsx

import { Link } from "react-router-dom";
import type { Usuario } from "../tipos";
import { useAuthorization } from "../../../../core/auth/useAuthorization";

// type Props = {
//   usuarios: Usuario[];
//   onView: (usuarioId: string) => void;
//   onEdit: (usuarioId: string) => void;
//   onInativar: (usuarioId: string) => void;
//   onReativar: (usuarioId: string) => void;
// };

// function formatarData(value: string | null) {
//   if (!value) return "—";
//   return new Date(value).toLocaleString("pt-BR");
// }

// export function UsuariosTable({
//   usuarios,
//   onView,
//   onEdit,
//   onInativar,
//   onReativar,
// }: Props) {
//   return (
//     <div className="overflow-x-auto rounded-2xl border bg-white">
//       <table className="min-w-full text-sm">
//         <thead>
//           <tr className="border-b bg-slate-50 text-left">
//             <th className="px-4 py-3">Nome</th>
//             <th className="px-4 py-3">E-mail</th>
//             <th className="px-4 py-3">Status</th>
//             <th className="px-4 py-3">Último login</th>
//             <th className="px-4 py-3">Ações</th>
//           </tr>
//         </thead>

//         <tbody>
//           {usuarios.map((usuario) => (
//             <tr key={usuario.usuarioId} className="border-b last:border-b-0">
//               <td className="px-4 py-3">{usuario.nome}</td>
//               <td className="px-4 py-3">{usuario.email}</td>
//               <td className="px-4 py-3">{usuario.status}</td>
//               <td className="px-4 py-3">{formatarData(usuario.ultimoLoginEm)}</td>
//               <td className="px-4 py-3">
//                 <div className="flex flex-wrap gap-2">
//                   <button className="rounded-lg border px-3 py-1.5" onClick={() => onView(usuario.usuarioId)}>
//                     Ver
//                   </button>
//                   <button className="rounded-lg border px-3 py-1.5" onClick={() => onEdit(usuario.usuarioId)}>
//                     Editar
//                   </button>

//                   {usuario.status === "ATIVO" ? (
//                     <button className="rounded-lg border px-3 py-1.5" onClick={() => onInativar(usuario.usuarioId)}>
//                       Inativar
//                     </button>
//                   ) : (
//                     <button className="rounded-lg border px-3 py-1.5" onClick={() => onReativar(usuario.usuarioId)}>
//                       Reativar
//                     </button>
//                   )}
//                 </div>
//               </td>
//             </tr>
//           ))}

//           {usuarios.length === 0 && (
//             <tr>
//               <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
//                 Nenhum usuário encontrado.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

type Props = {
  itens: Usuario[];
  onInativar?: (usuarioId: string) => void;
  onReativar?: (usuarioId: string) => void;
};

export function UsuariosTable({ itens, onInativar, onReativar }: Props) {
  const { canEditUsuario } = useAuthorization();
  const podeEditar = canEditUsuario();

  if (itens.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((usuario) => (
            <tr key={usuario.usuarioId} className="border-b last:border-b-0">
              <td className="px-4 py-3">{usuario.nome}</td>
              <td className="px-4 py-3">{usuario.email}</td>
              <td className="px-4 py-3">{usuario.status}</td>
              <td className="px-4 py-3">
                <div className="flex gap-3 items-center">
                  <Link
                    className="text-blue-600 underline"
                    to={`/app/usuarios/${usuario.usuarioId}`}
                  >
                    Detalhes
                  </Link>

                  {podeEditar ? (
                    <>
                      <Link
                        className="text-blue-600 underline"
                        to={`/app/usuarios/${usuario.usuarioId}/editar`}
                      >
                        Editar
                      </Link>

                      {usuario.status === "ATIVO" ? (
                        <button
                          className="text-red-600 underline"
                          type="button"
                          onClick={() => onInativar?.(usuario.usuarioId)}
                        >
                          Inativar
                        </button>
                      ) : null}

                      {usuario.status === "INATIVO" ? (
                        <button
                          className="text-green-600 underline"
                          type="button"
                          onClick={() => onReativar?.(usuario.usuarioId)}
                        >
                          Reativar
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">
                      Sem permissão de alteração
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
