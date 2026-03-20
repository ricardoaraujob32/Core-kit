import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { listarUsuarios, type UsuarioResumo } from "../usuarios/api/usuariosApi";
import { UsuariosList } from "../usuarios/components/UsuariosList";
import { HttpError } from "../../../core/api/httpClient";
import { mapErrorMessage } from "../../../core/errors/mapError";

export function TenantAdminDashboardPage() {
  const { session } = useAuth();
  const [items, setItems] = useState<UsuarioResumo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) return;

    void listarUsuarios(token)
      .then(setItems)
      .catch((err) => {
        if (err instanceof HttpError) {
          setError(mapErrorMessage(err.payload));
          return;
        }
        setError("Falha ao carregar usuários.");
      });
  }, [session?.accessToken]);

  return (
    <section>
      <h1>Admin do locatário</h1>
      <p>Painel administrativo inicial do locatário.</p>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      <UsuariosList items={items} />
    </section>
  );
}