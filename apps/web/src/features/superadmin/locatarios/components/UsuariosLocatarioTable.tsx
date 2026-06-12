// apps/web/src/features/superadmin/locatarios/components/UsuariosLocatarioTable.tsx

import type { UsuarioLocatario } from "../api/usuariosLocatarioApi";

type Props = {
  itens: UsuarioLocatario[];
  onEditar?: (usuarioId: string) => void;
  onBloquear?: (usuarioId: string) => void;
  onReativar?: (usuarioId: string) => void;
  onResetarSenha?: (usuarioId: string) => void;
};

export function UsuariosLocatarioTable({
  itens,
  onEditar,
  onBloquear,
  onReativar,
  onResetarSenha,
}: Props) {
  if (itens.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhum usuário cadastrado para este locatário.
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
            <th className="px-4 py-3">Perfil</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>

        <tbody>
          {itens.map((usuario) => {
            const status = usuario.status?.trim().toUpperCase();
            const ativo = status === "ATIVO";
            const bloqueado =
              status === "BLOQUEADO" ||
              status === "INATIVO" ||
              status === "SUSPENSO";

            return (
              <tr
                key={usuario.usuarioId}
                className="border-b last:border-b-0"
              >
                <td className="px-4 py-3">{usuario.nome}</td>
                <td className="px-4 py-3">{usuario.email}</td>
                <td className="px-4 py-3">{usuario.perfil ?? "—"}</td>
                <td className="px-4 py-3">{usuario.status ?? "—"}</td>
                <td className="px-4 py-3">{usuario.usuarioId}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="text-blue-600 underline disabled:opacity-50"
                      type="button"
                      onClick={() => onEditar?.(usuario.usuarioId)}
                    >
                      Editar
                    </button>

                    {ativo ? (
                      <button
                        className="text-red-600 underline disabled:opacity-50"
                        type="button"
                        onClick={() => onBloquear?.(usuario.usuarioId)}
                      >
                        Bloquear
                      </button>
                    ) : null}

                    {bloqueado ? (
                      <button
                        className="text-green-700 underline disabled:opacity-50"
                        type="button"
                        onClick={() => onReativar?.(usuario.usuarioId)}
                      >
                        Reativar
                      </button>
                    ) : null}

                    <button
                      className="text-blue-600 underline disabled:opacity-50"
                      type="button"
                      onClick={() => onResetarSenha?.(usuario.usuarioId)}
                    >
                      Resetar senha
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}