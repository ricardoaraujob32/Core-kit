// apps/web/src/features/auth/pages/LoginPage.tsx

import type { JSX } from "react";
import { useState } from "react";
import { useAuth } from "../../../core/auth/useAuth";
import "./login.css";

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
    <main className="ck-login-shell">
      <form className="ck-login-card ck-login-tenant" onSubmit={handleSubmit}>
        <header className="ck-login-header">
          <div className="ck-login-header-content">
            <div className="ck-login-mark">CK</div>
            <span className="ck-login-badge">Beta • Portfólio</span>
            <h1 className="ck-login-title">Entrar no Core-kit</h1>
            <p className="ck-login-subtitle">
              Sistema de gestão para clientes, produtos, compras e vendas.
            </p>
          </div>
        </header>

        <section className="ck-login-body">
          {erro ? <div className="ck-login-error">{erro}</div> : null}

          <label className="ck-login-field">
            <span className="ck-login-label">Locatário</span>
            <input
              className="ck-login-input"
              placeholder="Ex.: loja"
              value={locatarioSlug}
              onChange={(event) => setLocatarioSlug(event.target.value)}
              autoComplete="organization"
              required
            />
          </label>

          <label className="ck-login-field">
            <span className="ck-login-label">E-mail</span>
            <input
              className="ck-login-input"
              placeholder="usuario@email.com.br"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="ck-login-field">
            <span className="ck-login-label">Senha</span>
            <input
              className="ck-login-input"
              placeholder="Sua senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button className="ck-login-submit" type="submit" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>

          <p className="ck-login-footer">
            <strong>Core-kit Beta</strong> • Demonstração de portfólio
          </p>
        </section>
      </form>
    </main>
  );
}
