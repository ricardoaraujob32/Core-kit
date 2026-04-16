// apps/web/src/features/tenant-admin/usuarios/pages/minhaSenhaPage.tsx

import { useAuth } from "../../../../core/auth/useAuth";
import { UsuarioSenhaForm } from "../components/UsuarioSenhaForm";
import { useSenhaUsuario } from "../hooks/useSenhaUsuario";

export default function MinhaSenhaPage() {
  const { user } = useAuth();

  const {
    alterarMinhaSenha,
    erro,
    sucesso,
    isSaving,
  } = useSenhaUsuario({
    usuarioId: user?.usuarioId,
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Minha senha</h1>
        <p className="text-sm text-slate-600">
          Altere a sua senha de acesso.
        </p>
      </div>

      <UsuarioSenhaForm
        mode="alterar"
        isSaving={isSaving}
        erro={erro}
        sucesso={sucesso}
        onSubmit={(input) =>
          alterarMinhaSenha(input as { senhaAtual: string; novaSenha: string })
        }
      />
    </div>
  );
}