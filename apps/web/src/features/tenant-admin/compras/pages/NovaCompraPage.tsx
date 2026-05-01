// apps/web/src/features/tenant-admin/compras/pages/NovaCompraPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { comprasApi } from "../api/comprasApi";

export default function NovaCompraPage() {
  const navigate = useNavigate();

  const [fornecedorId, setFornecedorId] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await comprasApi.criar({
        fornecedorId: fornecedorId || null,
      });

      navigate(`/app/transacoes/${response.item.transacaoId}`);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="grid gap-4 rounded-2xl border bg-white p-6" onSubmit={handleSubmit}>
      <div>
        <h1 className="text-2xl font-semibold">Nova compra</h1>
        <p className="text-sm text-slate-600">
          Crie uma compra para depois adicionar os itens.
        </p>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      <label className="grid gap-1">
        <span className="text-sm font-medium">Fornecedor ID opcional</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={fornecedorId}
          onChange={(event) => setFornecedorId(event.target.value)}
          placeholder="Fornecedor ID"
        />
      </label>

      <div className="flex justify-end">
        <button
          className="rounded-xl border px-4 py-2"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Criando..." : "Criar compra"}
        </button>
      </div>
    </form>
  );
}