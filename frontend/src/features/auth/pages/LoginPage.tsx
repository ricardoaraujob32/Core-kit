// frontend/src/features/auth/pages/LoginPage.tsx

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HttpError } from "../../../core/api/httpClient";
import { useAuth } from "../../../core/auth/useAuth";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, user } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    try {
      const authenticatedUser = await login({ email, senha });

      const state = location.state as LocationState | null;
      const fallbackPath = authenticatedUser.isSuperAdmin ? "/superadmin" : "/app";

      navigate(state?.from?.pathname || fallbackPath, { replace: true });
    } catch (error) {
      if (error instanceof HttpError) {
        setErro(error.message);
        return;
      }

      setErro("Não foi possível realizar login.");
    }
  }

  return (
    <main>
      <h1>Entrar</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
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