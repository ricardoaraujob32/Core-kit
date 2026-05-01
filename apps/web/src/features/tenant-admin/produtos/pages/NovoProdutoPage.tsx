// apps/web/src/features/tenant-admin/produtos/pages/NovoProdutoPage.tsx

import { useState } from "react";
import { produtosApi } from "../api/produtosApi";
import type { TipoProduto } from "../tipos";

export default function NovoProdutoPage() {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoProduto>("PRODUTO");
  const [precoVenda, setPrecoVenda] = useState("0");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);

    try {
      await produtosApi.criar({
        nome,
        tipo,
        precoVenda: Number(precoVenda),
      });

      setSucesso("Produto/serviço criado com sucesso.");
      setNome("");
      setTipo("PRODUTO");
      setPrecoVenda("0");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao criar produto.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <h1>Novo produto/serviço</h1>

      {erro ? <div>{erro}</div> : null}
      {sucesso ? <div>{sucesso}</div> : null}

      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" required />

      <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoProduto)}>
        <option value="PRODUTO">Produto</option>
        <option value="SERVICO">Serviço</option>
      </select>

      <input
        value={precoVenda}
        onChange={(e) => setPrecoVenda(e.target.value)}
        placeholder="Preço de venda"
        type="number"
        min="0"
        step="0.01"
        required
      />

      <button type="submit">Salvar</button>
    </form>
  );
}