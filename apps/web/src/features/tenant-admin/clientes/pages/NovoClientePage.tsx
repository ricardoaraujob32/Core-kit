// apps/web/src/features/tenant-admin/clientes/pages/NovoClientePage.tsx

import { useState } from "react";
import { clientesApi } from "../api/clientesApi";

export default function NovoClientePage() {
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);

    try {
      await clientesApi.criar({
        nome,
        documento: documento || null,
        email: email || null,
        telefone: telefone || null,
      });

      setSucesso("Cliente criado com sucesso.");
      setNome("");
      setDocumento("");
      setEmail("");
      setTelefone("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao criar cliente.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <h1>Novo cliente</h1>

      {erro ? <div>{erro}</div> : null}
      {sucesso ? <div>{sucesso}</div> : null}

      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" required />
      <input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Documento" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" type="email" />
      <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone" />

      <button type="submit">Salvar</button>
    </form>
  );
}