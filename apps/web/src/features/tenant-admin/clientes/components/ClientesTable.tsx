// apps/web/src/features/tenant-admin/clientes/components/ClientesTable.tsx

import { Link } from "react-router-dom";
import type { Cliente } from "../tipos";

type Props = {
  itens: Cliente[];
  onExcluir?: (clienteId: string) => void;
};

export function ClientesTable({ itens, onExcluir }: Props) {
  if (itens.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhum cliente encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Documento</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>

        <tbody>
          {itens.map((cliente) => (
            <tr key={cliente.clienteId} className="border-b last:border-b-0">
              <td className="px-4 py-3">{cliente.nome}</td>
              <td className="px-4 py-3">{cliente.documento ?? "—"}</td>
              <td className="px-4 py-3">{cliente.email ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-3">
                  <Link className="text-blue-600 underline" to={`/app/clientes/${cliente.clienteId}`}>
                    Detalhes
                  </Link>

                  <Link className="text-blue-600 underline" to={`/app/clientes/${cliente.clienteId}/editar`}>
                    Editar
                  </Link>

                  <button
                    className="text-red-600 underline"
                    type="button"
                    onClick={() => onExcluir?.(cliente.clienteId)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}