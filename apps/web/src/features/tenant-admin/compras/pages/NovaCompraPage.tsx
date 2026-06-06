// apps/web/src/features/tenant-admin/compras/pages/NovaCompraPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { comprasApi } from "../api/comprasApi";

export default function NovaCompraPage() {
  const navigate = useNavigate();

  const [fornecedorId, setFornecedorId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await comprasApi.criar({
        fornecedorId: fornecedorId.trim() || null,
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
      <h1>Nova compra</h1>

      <p>Crie uma compra para depois adicionar os itens.</p>

      {erro ? <p role="alert">{erro}</p> : null}

      <label>
        Fornecedor ID opcional
        <input
          value={fornecedorId}
          onChange={(event) => setFornecedorId(event.target.value)}
          placeholder="Fornecedor ID"
        />
      </label>

      <label>
        Observação
        <textarea
          value={observacao}
          onChange={(event) => setObservacao(event.target.value)}
          placeholder="Observação da compra"
        />
      </label>

      <button type="submit" disabled={isSaving}>
        {isSaving ? "Criando..." : "Criar compra"}
      </button>
    </form>
  );
}