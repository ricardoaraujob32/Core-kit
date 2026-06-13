// apps/web/src/features/auth/pages/PlataformaLoginPage.tsx

import type { JSX } from "react";
import { useState } from "react";
import { useAuth } from "../../../core/auth/useAuth";
import "./login.css";

export default function PlataformaLoginPage(): JSX.Element {
  const { loginPlataforma, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    try {
      await loginPlataforma({
        email: email.trim(),
        senha,
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao autenticar.");
    }
  }

  return (
    <main className="ck-login-shell">
      <form className="ck-login-card ck-login-platform" onSubmit={handleSubmit}>
        <header className="ck-login-header">
          <div className="ck-login-header-content">
            <div className="ck-login-mark">CK</div>
            <span className="ck-login-badge">Plataforma</span>
            <h1 className="ck-login-title">Login da plataforma</h1>
            <p className="ck-login-subtitle">
              Administração global de locatários, módulos e usuários.
            </p>
          </div>
        </header>

        <section className="ck-login-body">
          {erro ? <div className="ck-login-error">{erro}</div> : null}

          <label className="ck-login-field">
            <span className="ck-login-label">E-mail</span>
            <input
              className="ck-login-input"
              placeholder="admin@plataforma.com"
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
            {isLoading ? "Entrando..." : "Entrar na plataforma"}
          </button>

          <p className="ck-login-footer">
            <strong>Core-kit Plataforma</strong> • Área administrativa
          </p>
        </section>
      </form>
    </main>
  );
}
