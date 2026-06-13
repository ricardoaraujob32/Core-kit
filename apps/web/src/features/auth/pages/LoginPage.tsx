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
    <form
      className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl"
      onSubmit={handleSubmit}
    >
      <div className="bg-gradient-to-br from-slate-950 to-blue-900 px-8 py-8 text-white">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-lg font-black shadow-inner">
          CK
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">
            Entrar no Core-kit
          </h1>

          <p className="mt-2 text-sm text-blue-100">
            Acesse a área do locatário para operar clientes, produtos, compras e vendas.
          </p>
        </div>
      </div>

      <div className="grid gap-4 px-8 py-8">
        {erro ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        ) : null}

        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-700">Locatário</span>
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            placeholder="Ex.: loja"
            value={locatarioSlug}
            onChange={(event) => setLocatarioSlug(event.target.value)}
            autoComplete="organization"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-700">E-mail</span>
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            placeholder="usuario@email.com.br"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-700">Senha</span>
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            placeholder="Sua senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button
          className="mt-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-xs text-slate-500">
          Core-kit Beta • Demonstração de portfólio
        </p>
      </div>
    </form>
  );
}
