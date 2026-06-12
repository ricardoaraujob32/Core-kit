// apps/web/src/features/tenant-admin/fornecedores/components/FornecedoresTable.tsx

import { Link } from "react-router-dom";
import type { Fornecedor } from "../tipos";

type Props = {
  itens: Fornecedor[];
  onExcluir?: (fornecedorId: string) => void;
};

export function FornecedoresTable({ itens, onExcluir }: Props) {
  if (itens.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhum fornecedor encontrado.
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
          {itens.map((fornecedor) => (
            <tr key={fornecedor.fornecedorId} className="border-b last:border-b-0">
              <td className="px-4 py-3">{fornecedor.nome}</td>
              <td className="px-4 py-3">{fornecedor.documento ?? "—"}</td>
              <td className="px-4 py-3">{fornecedor.email ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-3">
                  <Link
                    className="text-blue-600 underline"
                    to={`/app/fornecedores/${fornecedor.fornecedorId}`}
                  >
                    Detalhes
                  </Link>

                  <Link
                    className="text-blue-600 underline"
                    to={`/app/fornecedores/${fornecedor.fornecedorId}/editar`}
                  >
                    Editar
                  </Link>

                  <button
                    className="text-red-600 underline"
                    type="button"
                    onClick={() => onExcluir?.(fornecedor.fornecedorId)}
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