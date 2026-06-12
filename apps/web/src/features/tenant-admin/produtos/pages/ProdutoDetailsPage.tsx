// apps/web/src/features/tenant-admin/produtos/pages/ProdutoDetailsPage.tsx

import { Link, useParams } from "react-router-dom";
import { useProdutoDetails } from "../hooks/useProdutoDetails";

export default function ProdutoDetailsPage() {
  const params = useParams<{ produtoId: string }>();
  const produtoId = params.produtoId?.trim();

  const { produto, isLoading, erro } = useProdutoDetails(produtoId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        Carregando produto...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {erro}
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Produto não encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{produto.nome}</h1>
          <p className="text-sm text-slate-600">
            {produto.tipo} — {produto.precoVenda}
          </p>
        </div>

        <Link
          className="rounded-xl border px-4 py-2"
          to={`/app/produtos/${produto.produtoId}/editar`}
        >
          Editar
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-white p-6 text-sm">
        <div><strong>ID:</strong> {produto.produtoId}</div>
        <div><strong>Nome:</strong> {produto.nome}</div>
        <div><strong>Tipo:</strong> {produto.tipo}</div>
        <div><strong>Preço de venda:</strong> {produto.precoVenda}</div>
        <div><strong>Descrição:</strong> {produto.descricao ?? "—"}</div>
        <div><strong>Ativo:</strong> {produto.ativo === false ? "Não" : "Sim"}</div>
        <div><strong>Criado em:</strong> {produto.criadoEm ?? "—"}</div>
        <div><strong>Atualizado em:</strong> {produto.atualizadoEm ?? "—"}</div>
      </div>
    </div>
  );
}