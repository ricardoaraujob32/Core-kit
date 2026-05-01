// apps/web/src/features/tenant-admin/vendas/pages/NovaVendaPage.tsx

import { useState } from "react";
import { vendasApi } from "../api/vendasApi";
import { mapError } from "../../../../core/errors/mapError";
import { useNavigate } from "react-router-dom";

export default function NovaVendaPage() {
  const navigate = useNavigate();

  const [clienteId, setClienteId] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await vendasApi.criar({
        clienteId: clienteId || null,
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
        <h1 className="text-2xl font-semibold">Nova venda</h1>
        <p className="text-sm text-slate-600">
          Crie uma venda para depois adicionar os itens.
        </p>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      <label className="grid gap-1">
        <span className="text-sm font-medium">Cliente ID opcional</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={clienteId}
          onChange={(event) => setClienteId(event.target.value)}
          placeholder="Cliente ID"
        />
      </label>

      <div className="flex justify-end">
        <button
          className="rounded-xl border px-4 py-2"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Criando..." : "Criar venda"}
        </button>
      </div>
    </form>
  );
}