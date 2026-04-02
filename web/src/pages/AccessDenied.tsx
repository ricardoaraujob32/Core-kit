// frontend/src/pages/AccessDenied.tsx

import { Link } from "react-router-dom";
import { useAuth } from "../core/auth/useAuth";
import { isSuperAdmin } from "../core/auth/types";

export default function AccessDenied(): JSX.Element {
  const { user } = useAuth();

  const fallbackHref = isSuperAdmin(user) ? "/superadmin" : "/app";

  return (
    <main style={{ padding: 24 }}>
      <h1>Acesso negado</h1>
      <p>Você não possui permissão para acessar esta área.</p>
      <Link to={fallbackHref}>Voltar</Link>
    </main>
  );
}