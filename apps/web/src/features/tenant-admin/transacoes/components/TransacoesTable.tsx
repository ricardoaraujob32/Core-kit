// apps/web/src/features/tenant-admin/transacoes/components/TransacoesTable.tsx

import { Link } from "react-router-dom";
import type { Cliente } from "../../clientes/tipos";
import type { Fornecedor } from "../../fornecedores/tipos";
import type { Transacao } from "../tipos";

type Props = {
  itens: Transacao[];
  clientes?: Cliente[];
  fornecedores?: Fornecedor[];
};

function formatarMoeda(valor?: number | null): string {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR");
}

function codigoCurto(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function labelPessoa(
  transacao: Transacao,
  clientesPorId: Map<string, Cliente>,
  fornecedoresPorId: Map<string, Fornecedor>,
): string {
  if (transacao.tipo === "COMPRA") {
    if (!transacao.fornecedorId) return "—";

    const fornecedor = fornecedoresPorId.get(transacao.fornecedorId);

    if (!fornecedor) return `Fornecedor ${codigoCurto(transacao.fornecedorId)}`;

    return fornecedor.documento
      ? `${fornecedor.nome} — ${fornecedor.documento}`
      : fornecedor.nome;
  }

  if (!transacao.clienteId) return "—";

  const cliente = clientesPorId.get(transacao.clienteId);

  if (!cliente) return `Cliente ${codigoCurto(transacao.clienteId)}`;

  return cliente.documento ? `${cliente.nome} — ${cliente.documento}` : cliente.nome;
}

function statusBadgeClass(status: string): string {
  const normalizado = status.trim().toUpperCase();

  if (normalizado === "CONCLUIDA") {
    return "rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700";
  }

  if (normalizado === "CANCELADA") {
    return "rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700";
  }

  if (normalizado === "RASCUNHO" || normalizado === "ABERTA") {
    return "rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700";
  }

  return "rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700";
}

export function TransacoesTable({
  itens,
  clientes = [],
  fornecedores = [],
}: Props) {
  const clientesPorId = new Map(clientes.map((cliente) => [cliente.clienteId, cliente]));
  const fornecedoresPorId = new Map(
    fornecedores.map((fornecedor) => [fornecedor.fornecedorId, fornecedor]),
  );

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
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Cliente/fornecedor</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Subtotal</th>
            <th className="px-4 py-3">Desconto</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Criada em</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>

        <tbody>
          {itens.map((transacao) => (
            <tr key={transacao.transacaoId} className="border-b last:border-b-0">
              <td className="px-4 py-3 font-medium">
                {codigoCurto(transacao.transacaoId)}
              </td>
              <td className="px-4 py-3">{transacao.tipo}</td>
              <td className="px-4 py-3">
                {labelPessoa(transacao, clientesPorId, fornecedoresPorId)}
              </td>
              <td className="px-4 py-3">
                <span className={statusBadgeClass(transacao.status)}>
                  {transacao.status}
                </span>
              </td>
              <td className="px-4 py-3">{formatarMoeda(transacao.valorSubtotal)}</td>
              <td className="px-4 py-3">{formatarMoeda(transacao.valorDesconto)}</td>
              <td className="px-4 py-3 font-medium">
                {formatarMoeda(transacao.valorTotal)}
              </td>
              <td className="px-4 py-3">{formatarData(transacao.criadoEm)}</td>
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
