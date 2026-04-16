// apps/web/src/features/superadmin/locatarios/components/LocatariosTable.tsx

import { Link } from "react-router-dom";
import type { Locatario } from "../tipos";

type Props = {
  itens: Locatario[];
};

export function LocatariosTable({ itens }: Props) {
  if (itens.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhum locatário encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Slug</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.locatarioId} className="border-b last:border-b-0">
              <td className="px-4 py-3">{item.nome}</td>
              <td className="px-4 py-3">{item.slug}</td>
              <td className="px-4 py-3">{item.email}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <Link
                    className="text-blue-600 underline"
                    to={`/superadmin/locatarios/${item.locatarioId}`}
                  >
                    Detalhes
                  </Link>
                  <Link
                    className="text-blue-600 underline"
                    to={`/superadmin/locatarios/${item.locatarioId}/editar`}
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