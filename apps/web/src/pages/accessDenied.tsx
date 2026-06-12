// apps/web/src/pages/accessDenied.tsx

import { Link } from "react-router-dom";
import { JSX } from "react";

export default function AccessDenied(): JSX.Element {
  return (
    <main style={{ padding: 24 }}>
      <h1>Acesso negado</h1>
      <p>Você não possui permissão para acessar esta área.</p>
      <Link to="/app">Voltar</Link>
    </main>
  );
}
