// frontend/src/features/tenant-admin/pages/Dashboard.tsx

import { useAuth } from "../../../core/auth/useAuth";
import { useTenant } from "../../../core/tenant/useTenant";

export default function Dashboard(): JSX.Element {
  const { user } = useAuth();
  const { branding } = useTenant();

  return (
    <section>
      <h1>Dashboard do Locatário</h1>
      <p>Integração com backend validada para área tenant-aware.</p>

      <pre>
        {JSON.stringify(
          {
            usuarioId: user?.usuarioId,
            locatarioId: user?.locatarioId,
            isSuperAdmin: user?.isSuperAdmin,
            papeis: user?.papeis,
            permissoes: user?.permissoes,
            branding,
          },
          null,
          2,
        )}
      </pre>
    </section>
  );
}