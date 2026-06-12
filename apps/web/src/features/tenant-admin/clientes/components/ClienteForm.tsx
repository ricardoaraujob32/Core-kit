// apps/web/src/features/tenant-admin/clientes/components/ClienteForm.tsx

import { useMemo, useState } from "react";
import type { AtualizarClienteInput, Cliente, CriarClienteInput } from "../tipos";

type Props = {
  mode: "create" | "edit";
  initialData?: Cliente | null;
  isSaving?: boolean;
  erro?: string | null;
  onSubmit: (input: CriarClienteInput | AtualizarClienteInput) => void | Promise<void>;
};

export function ClienteForm({ mode, initialData, isSaving, erro, onSubmit }: Props) {
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [documento, setDocumento] = useState(initialData?.documento ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [telefone, setTelefone] = useState(initialData?.telefone ?? "");

  const titulo = useMemo(
    () => (mode === "create" ? "Novo cliente" : "Editar cliente"),
    [mode],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      nome,
      documento: documento || null,
      email: email || null,
      telefone: telefone || null,
    });
  }

  return (
    <form className="grid gap-4 rounded-2xl border bg-white p-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold">{titulo}</h2>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      <label className="grid gap-1">
        <span className="text-sm font-medium">Nome</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          required
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Documento</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={documento}
          onChange={(event) => setDocumento(event.target.value)}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">E-mail</span>
        <input
          className="rounded-xl border px-3 py-2"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Telefone</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={telefone}
          onChange={(event) => setTelefone(event.target.value)}
        />
      </label>

      <div className="flex justify-end">
        <button
          className="rounded-xl border px-4 py-2 font-medium"
          type="submit"
          disabled={Boolean(isSaving)}
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}