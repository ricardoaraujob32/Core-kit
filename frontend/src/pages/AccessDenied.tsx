import { Link } from "react-router-dom";

export function AccessDeniedPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Acesso negado</h1>
      <p>Seu perfil não possui a permissão necessária para esta área.</p>
      <Link to="/auth/login">Voltar ao login</Link>
    </main>
  );
}