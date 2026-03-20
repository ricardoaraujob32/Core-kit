// frontend/src/pages/AccessDenied.tsx

import { Link } from "react-router-dom";
import { useAuth } from "../core/auth/useAuth";

export default function AccessDenied(): JSX.Element {
  const { user } = useAuth();

  const fallbackHref = user?.isSuperAdmin ? "/superadmin" : "/app";

  return (
    <main style={{ padding: 24 }}>
      <h1>Acesso negado</h1>
      <p>Você não possui permissão para acessar esta área.</p>
      <Link to={fallbackHref}>Voltar</Link>
    </main>
  );
}