// apps/web/src/features/auth/pages/LoginPage.tsx

import type { JSX, FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import { isPlataforma } from "../../../core/auth/tipos";
import { mapError } from "../../../core/errors/mapError";

type LoginMode = "TENANT" | "PLATAFORMA";

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login, loginPlataforma, isLoading } = useAuth();

  const [mode, setMode] = useState<LoginMode>("TENANT");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [locatarioSlug, setLocatarioSlug] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    try {
      const authenticatedUser =
        mode === "PLATAFORMA"
          ? await loginPlataforma({ email, senha })
          : await login({
              email,
              senha,
              locatarioSlug: locatarioSlug.trim(),
            });

      const targetPath = isPlataforma(authenticatedUser)
        ? "/superadmin"
        : "/app";

      console.log("LOGIN USER", authenticatedUser);
      console.log("REDIRECT", targetPath);

      queueMicrotask(() => {
        navigate(targetPath, { replace: true });
      });

      navigate(targetPath, { replace: true });
    } catch (error) {
      setErro(mapError(error).message);
    }
  }

  return (
    <main>
      <h1>Entrar</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <input
              type="radio"
              name="loginMode"
              value="TENANT"
              checked={mode === "TENANT"}
              onChange={() => setMode("TENANT")}
            />
            Locatário
          </label>

          <label style={{ marginLeft: 12 }}>
            <input
              type="radio"
              name="loginMode"
              value="PLATAFORMA"
              checked={mode === "PLATAFORMA"}
              onChange={() => setMode("PLATAFORMA")}
            />
            Plataforma
          </label>
        </div>

        {mode === "TENANT" ? (
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
        ) : null}

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