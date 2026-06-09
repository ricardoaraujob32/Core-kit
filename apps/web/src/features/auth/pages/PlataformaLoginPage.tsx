// apps/web/src/features/auth/pages/PlataformaLoginPage.tsx

import type { FormEvent, JSX } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import { mapError } from "../../../core/errors/mapError";

export default function PlataformaLoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { loginPlataforma, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    try {
      await loginPlataforma({
        email: email.trim(),
        senha,
      });

      navigate("/plataforma", { replace: true });
    } catch (error) {
      setErro(mapError(error).message);
    }
  }

  return (
    <main>
      <h1>Entrar na plataforma</h1>

      <p>Área administrativa da plataforma.</p>

      <form onSubmit={handleSubmit}>
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

      <p>
        <Link to="/login">Ir para login do locatário</Link>
      </p>
    </main>
  );
}
