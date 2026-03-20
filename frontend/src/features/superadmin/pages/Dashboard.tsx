import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { listarLocatarios, type LocatarioResumo } from "../locatarios/api/locatariosApi";
import { LocatariosList } from "../locatarios/components/LocatariosList";
import { HttpError } from "../../../core/api/httpClient";
import { mapErrorMessage } from "../../../core/errors/mapError";

export function SuperAdminDashboardPage() {
  const { session } = useAuth();
  const [items, setItems] = useState<LocatarioResumo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) return;

    void listarLocatarios(token)
      .then(setItems)
      .catch((err) => {
        if (err instanceof HttpError) {
          setError(mapErrorMessage(err.payload));
          return;
        }
        setError("Falha ao carregar locatários.");
      });
  }, [session?.accessToken]);

  return (
    <section>
      <h1>Superadmin</h1>
      <p>Painel inicial da plataforma.</p>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      <LocatariosList items={items} />
    </section>
  );
}