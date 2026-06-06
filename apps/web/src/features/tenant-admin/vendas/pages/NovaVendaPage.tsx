// apps/web/src/features/tenant-admin/vendas/pages/NovaVendaPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { vendasApi } from "../api/vendasApi";

export default function NovaVendaPage() {
  const navigate = useNavigate();

  const [clienteId, setClienteId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await vendasApi.criar({
        clienteId: clienteId.trim() || null,
        observacao: observacao.trim() || null,
      });

      navigate(`/app/transacoes/${response.item.transacaoId}`);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Nova venda</h1>

      <p>Crie uma venda para depois adicionar os itens.</p>

      {erro ? <p role="alert">{erro}</p> : null}

      <label>
        Cliente ID opcional
        <input
          value={clienteId}
          onChange={(event) => setClienteId(event.target.value)}
          placeholder="Cliente ID"
        />
      </label>

      <label>
        Observação
        <textarea
          value={observacao}
          onChange={(event) => setObservacao(event.target.value)}
          placeholder="Observação da venda"
        />
      </label>

      <button type="submit" disabled={isSaving}>
        {isSaving ? "Criando..." : "Criar venda"}
      </button>
    </form>
  );
}