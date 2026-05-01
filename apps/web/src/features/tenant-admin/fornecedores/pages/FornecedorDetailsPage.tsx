// apps/web/src/features/tenant-admin/fornecedores/pages/FornecedorDetailsPage.tsx

import { Link, useParams } from "react-router-dom";
import { useFornecedorDetails } from "../hooks/useFornecedorDetails";

export default function FornecedorDetailsPage() {
  const params = useParams<{ fornecedorId: string }>();
  const fornecedorId = params.fornecedorId?.trim();

  const { fornecedor, isLoading, erro } = useFornecedorDetails(fornecedorId);

  if (isLoading) {
    return <div className="rounded-2xl border bg-white p-6">Carregando fornecedor...</div>;
  }

  if (erro) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>;
  }

  if (!fornecedor) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Fornecedor não encontrado.</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{fornecedor.nome}</h1>
          <p className="text-sm text-slate-600">
            {fornecedor.documento ?? "Sem documento"}
          </p>
        </div>

        <Link
          className="rounded-xl border px-4 py-2"
          to={`/app/fornecedores/${fornecedor.fornecedorId}/editar`}
        >
          Editar
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-white p-6 text-sm">
        <div><strong>ID:</strong> {fornecedor.fornecedorId}</div>
        <div><strong>Nome:</strong> {fornecedor.nome}</div>
        <div><strong>Documento:</strong> {fornecedor.documento ?? "—"}</div>
        <div><strong>E-mail:</strong> {fornecedor.email ?? "—"}</div>
        <div><strong>Telefone:</strong> {fornecedor.telefone ?? "—"}</div>
        <div><strong>Criado em:</strong> {fornecedor.criadoEm ?? "—"}</div>
        <div><strong>Atualizado em:</strong> {fornecedor.atualizadoEm ?? "—"}</div>
      </div>
    </div>
  );
}