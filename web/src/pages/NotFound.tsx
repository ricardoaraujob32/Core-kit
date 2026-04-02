// frontend/src/pages/NotFound.tsx

import { Link } from "react-router-dom";

export default function NotFound(): JSX.Element {
  return (
    <main style={{ padding: 24 }}>
      <h1>Página não encontrada</h1>
      <p>A rota informada não existe.</p>
      <Link to="/login">Ir para login</Link>
    </main>
  );
}