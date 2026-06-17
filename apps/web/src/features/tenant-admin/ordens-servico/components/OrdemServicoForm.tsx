import { useState, type FormEvent } from "react";
import type { CriarOrdemServicoInput } from "../tipos";

export function OrdemServicoForm({ onSubmit, initialValues }: { onSubmit: (input: CriarOrdemServicoInput) => Promise<void>; initialValues?: Partial<CriarOrdemServicoInput> }) {
  const [titulo, setTitulo] = useState(initialValues?.titulo ?? "");
  const [clienteId, setClienteId] = useState(initialValues?.clienteId ?? "");
  const [descricao, setDescricao] = useState(initialValues?.descricao ?? "");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);
    try {
      await onSubmit({ titulo, clienteId: clienteId || null, descricao: descricao || null });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <label>
        Cliente ID
        <input value={clienteId} onChange={(e) => setClienteId(e.target.value)} placeholder="UUID do cliente" />
      </label>
      <label>
        Título
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required minLength={3} />
      </label>
      <label>
        Descrição
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </label>
      <button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
    </form>
  );
}
