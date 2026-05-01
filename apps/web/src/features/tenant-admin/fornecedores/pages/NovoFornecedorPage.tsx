// apps/web/src/features/tenant-admin/fornecedores/pages/NovoFornecedorPage.tsx

import { useState } from "react";
import { fornecedoresApi } from "../api/fornecedoresApi";

export default function NovoFornecedorPage() {
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);

    try {
      await fornecedoresApi.criar({
        nome,
        documento: documento || null,
      });

      setSucesso("Fornecedor criado com sucesso.");
      setNome("");
      setDocumento("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao criar fornecedor.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <h1>Novo fornecedor</h1>

      {erro ? <div>{erro}</div> : null}
      {sucesso ? <div>{sucesso}</div> : null}

      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" required />
      <input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Documento" />

      <button type="submit">Salvar</button>
    </form>
  );
}