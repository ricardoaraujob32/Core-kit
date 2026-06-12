// apps/web/src/features/tenant-admin/usuarios/components/UsuarioSenhaForm.tsx

import { useMemo, useState } from "react";
import type { AlterarMinhaSenhaInput, RedefinirSenhaUsuarioInput } from "../tipos";

type Props = {
  mode: "alterar" | "redefinir";
  isSaving?: boolean;
  erro?: string | null;
  sucesso?: string | null;
  onSubmit: (
    input: AlterarMinhaSenhaInput | RedefinirSenhaUsuarioInput,
  ) => void | Promise<void>;
};

export function UsuarioSenhaForm({ mode, isSaving, erro, sucesso, onSubmit }: Props) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");

  const titulo = useMemo(
    () =>
      mode === "alterar" ? "Alterar minha senha" : "Redefinir senha do usuário",
    [mode],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (novaSenha !== confirmacao) {
      return;
    }

    if (mode === "alterar") {
      await onSubmit({
        senhaAtual,
        novaSenha,
      });
    } else {
      await onSubmit({
        novaSenha,
      });
    }

    setSenhaAtual("");
    setNovaSenha("");
    setConfirmacao("");
  }

  const senhasDiferentes =
    confirmacao.length > 0 && novaSenha !== confirmacao;

  return (
    <form
      className="grid gap-4 rounded-2xl border bg-white p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="text-lg font-semibold">{titulo}</h2>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      {sucesso ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {sucesso}
        </div>
      ) : null}

      {mode === "alterar" ? (
        <label className="grid gap-1">
          <span className="text-sm font-medium">Senha atual</span>
          <input
            className="rounded-xl border px-3 py-2"
            type="password"
            value={senhaAtual}
            onChange={(event) => setSenhaAtual(event.target.value)}
            minLength={4}
            required
          />
        </label>
      ) : null}

      <label className="grid gap-1">
        <span className="text-sm font-medium">Nova senha</span>
        <input
          className="rounded-xl border px-3 py-2"
          type="password"
          value={novaSenha}
          onChange={(event) => setNovaSenha(event.target.value)}
          minLength={4}
          required
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Confirmar nova senha</span>
        <input
          className="rounded-xl border px-3 py-2"
          type="password"
          value={confirmacao}
          onChange={(event) => setConfirmacao(event.target.value)}
          minLength={4}
          required
        />
      </label>

      {senhasDiferentes ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          A confirmação da senha não confere.
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          className="rounded-xl border px-4 py-2 font-medium"
          type="submit"
          disabled={Boolean(isSaving) || senhasDiferentes}
        >
          {isSaving ? "Salvando..." : "Salvar senha"}
        </button>
      </div>
    </form>
  );
}
