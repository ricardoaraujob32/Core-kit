// apps/web/src/features/tenant-admin/transacoes/components/TransacoesTable.tsx

import { Link } from "react-router-dom";
import type { Transacao } from "../tipos";

type Props = {
  itens: Transacao[];
};

export function TransacoesTable({ itens }: Props) {
  if (itens.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhuma transação encontrada.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>

        <tbody>
          {itens.map((transacao) => (
            <tr key={transacao.transacaoId} className="border-b last:border-b-0">
              <td className="px-4 py-3">{transacao.transacaoId}</td>
              <td className="px-4 py-3">{transacao.tipo}</td>
              <td className="px-4 py-3">{transacao.status}</td>
              <td className="px-4 py-3">{transacao.valorTotal ?? 0}</td>
              <td className="px-4 py-3">
                <Link
                  className="text-blue-600 underline"
                  to={`/app/transacoes/${transacao.transacaoId}`}
                >
                  Detalhes
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}