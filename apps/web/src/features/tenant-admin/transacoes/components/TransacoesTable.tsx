// apps/web/src/features/tenant-admin/transacoes/components/TransacoesTable.tsx

import { Link } from "react-router-dom";
import { StatusBadge } from "../../../../shared/ui";
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

  return date.toLocaleDateString("pt-BR");
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
    if (!transacao.fornecedorId) return "Sem fornecedor";

    const fornecedor = fornecedoresPorId.get(transacao.fornecedorId);

    if (!fornecedor) return `Fornecedor #${codigoCurto(transacao.fornecedorId)}`;

    return fornecedor.documento
      ? `${fornecedor.nome} — ${fornecedor.documento}`
      : fornecedor.nome;
  }

  if (!transacao.clienteId) return "Sem cliente";

  const cliente = clientesPorId.get(transacao.clienteId);

  if (!cliente) return `Cliente #${codigoCurto(transacao.clienteId)}`;

  return cliente.documento ? `${cliente.nome} — ${cliente.documento}` : cliente.nome;
}

export function TransacoesTable({
  itens,
  clientes = [],
  fornecedores = [],
}: Props) {
  const clientesPorId = new Map(
    clientes.map((cliente) => [cliente.clienteId, cliente]),
  );

  const fornecedoresPorId = new Map(
    fornecedores.map((fornecedor) => [fornecedor.fornecedorId, fornecedor]),
  );

  return (
    <div className="grid gap-3">
      <div className="hidden overflow-x-auto rounded-2xl border bg-white md:block">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Cliente/fornecedor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Criada em</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {itens.map((transacao) => (
              <tr key={transacao.transacaoId} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium">
                  #{codigoCurto(transacao.transacaoId)}
                </td>
                <td className="px-4 py-3">{transacao.tipo}</td>
                <td className="px-4 py-3">
                  {labelPessoa(transacao, clientesPorId, fornecedoresPorId)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={transacao.status} />
                </td>
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

      <div className="grid gap-3 md:hidden">
        {itens.map((transacao) => (
          <article
            key={transacao.transacaoId}
            className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">
                  {transacao.tipo} #{codigoCurto(transacao.transacaoId)}
                </div>
                <div className="text-sm text-slate-600">
                  {labelPessoa(transacao, clientesPorId, fornecedoresPorId)}
                </div>
              </div>

              <StatusBadge value={transacao.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500">Total</div>
                <div className="font-medium">{formatarMoeda(transacao.valorTotal)}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Criada em</div>
                <div>{formatarData(transacao.criadoEm)}</div>
              </div>
            </div>

            <Link
              className="rounded-xl border px-4 py-2 text-center text-sm"
              to={`/app/transacoes/${transacao.transacaoId}`}
            >
              Ver detalhes
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
