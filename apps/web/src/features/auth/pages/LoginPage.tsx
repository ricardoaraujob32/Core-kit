// apps/web/src/features/auth/pages/LoginPage.tsx

import type { JSX, FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import { mapError } from "../../../core/errors/mapError";

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [locatarioSlug, setLocatarioSlug] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    try {
      await login({
        email: email.trim(),
        senha,
        locatarioSlug: locatarioSlug.trim(),
      });

      navigate("/app", { replace: true });
    } catch (error) {
      setErro(mapError(error).message);
    }
  }

  return (
    <main>
      <h1>Entrar</h1>

      <p>Área administrativa do locatário.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="locatarioSlug">Locatário</label>
          <input
            id="locatarioSlug"
            type="text"
            value={locatarioSlug}
            onChange={(event) => setLocatarioSlug(event.target.value)}
            autoComplete="organization"
            required
          />
        </div>

        <div>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {erro ? <p role="alert">{erro}</p> : null}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}