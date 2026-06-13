// apps/web/src/features/auth/pages/LoginPage.tsx

import type { JSX } from "react";
import { useState } from "react";
import { useAuth } from "../../../core/auth/useAuth";

export default function LoginPage(): JSX.Element {
  const { login, isLoading } = useAuth();

  const [locatarioSlug, setLocatarioSlug] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    try {
      await login({
        locatarioSlug: locatarioSlug.trim(),
        email: email.trim(),
        senha,
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao autenticar.");
    }
  }

  return (
    <form className="mx-auto grid w-full max-w-sm gap-4" onSubmit={handleSubmit}>
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="text-sm text-slate-600">Acesse a área do locatário.</p>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      <label className="grid gap-1">
        <span className="text-center text-sm font-medium">Locatário</span>
        <input
          className="rounded-xl border px-3 py-2 text-center"
          placeholder="Ex.: loja"
          value={locatarioSlug}
          onChange={(event) => setLocatarioSlug(event.target.value)}
          autoComplete="organization"
          required
        />
      </label>

      <label className="grid gap-1">
        <span className="text-center text-sm font-medium">E-mail</span>
        <input
          className="rounded-xl border px-3 py-2 text-center"
          placeholder="usuario@email.com.br"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label className="grid gap-1">
        <span className="text-center text-sm font-medium">Senha</span>
        <input
          className="rounded-xl border px-3 py-2 text-center"
          placeholder="Sua senha"
          type="password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      <button
        className="rounded-xl border px-4 py-2"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
