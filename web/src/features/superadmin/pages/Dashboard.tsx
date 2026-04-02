// frontend/src/features/superadmin/pages/Dashboard.tsx

import { useAuth } from "../../../core/auth/useAuth";

export default function Dashboard(): JSX.Element {
  const { user } = useAuth();

  return (
    <section>
      <h1>Dashboard SuperAdmin</h1>
      <p>Integração com backend validada para área de plataforma.</p>

      <pre>
        {JSON.stringify(
          {
            id: user?.id,
            locatarioId: user?.locatarioId,
            papeis: user?.papeis,
            permissoes: user?.permissoes,
          },
          null,
          2,
        )}
      </pre>
    </section>
  );
}