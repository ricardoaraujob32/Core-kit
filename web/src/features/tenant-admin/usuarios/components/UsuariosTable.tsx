
import type { Usuario } from "../types";

type Props = {
  usuarios: Usuario[];
  onView: (usuarioId: string) => void;
  onEdit: (usuarioId: string) => void;
  onInativar: (usuarioId: string) => void;
  onReativar: (usuarioId: string) => void;
};

function formatarData(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

export function UsuariosTable({
  usuarios,
  onView,
  onEdit,
  onInativar,
  onReativar,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Último login</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.usuarioId} className="border-b last:border-b-0">
              <td className="px-4 py-3">{usuario.nome}</td>
              <td className="px-4 py-3">{usuario.email}</td>
              <td className="px-4 py-3">{usuario.status}</td>
              <td className="px-4 py-3">{formatarData(usuario.ultimoLoginEm)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-lg border px-3 py-1.5" onClick={() => onView(usuario.usuarioId)}>
                    Ver
                  </button>
                  <button className="rounded-lg border px-3 py-1.5" onClick={() => onEdit(usuario.usuarioId)}>
                    Editar
                  </button>

                  {usuario.status === "ATIVO" ? (
                    <button className="rounded-lg border px-3 py-1.5" onClick={() => onInativar(usuario.usuarioId)}>
                      Inativar
                    </button>
                  ) : (
                    <button className="rounded-lg border px-3 py-1.5" onClick={() => onReativar(usuario.usuarioId)}>
                      Reativar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {usuarios.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                Nenhum usuário encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
