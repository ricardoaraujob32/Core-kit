
import { useMemo, useState } from "react";
import type { AtualizarUsuarioInput, CriarUsuarioInput, Usuario, UsuarioFormMode } from "../types";

type Props = {
  mode: UsuarioFormMode;
  initialData?: Usuario | null;
  isSaving?: boolean;
  erro?: string | null;
  onSubmit: (input: CriarUsuarioInput | AtualizarUsuarioInput) => void | Promise<void>;
};

export function UsuarioForm({ mode, initialData, isSaving, erro, onSubmit }: Props) {
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [senha, setSenha] = useState("");

  const titulo = useMemo(
    () => (mode === "create" ? "Novo usuário" : "Editar usuário"),
    [mode],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "create") {
      await onSubmit({
        nome,
        email,
        senha,
      });
      return;
    }

    await onSubmit({
      nome,
      email,
    });
  }

  return (
    <form className="grid gap-4 rounded-2xl border bg-white p-6" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-semibold">{titulo}</h2>
      </div>

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
        <span className="text-sm font-medium">E-mail</span>
        <input
          className="rounded-xl border px-3 py-2"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      {mode === "create" ? (
        <label className="grid gap-1">
          <span className="text-sm font-medium">Senha inicial</span>
          <input
            className="rounded-xl border px-3 py-2"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
            minLength={6}
          />
        </label>
      ) : null}

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
