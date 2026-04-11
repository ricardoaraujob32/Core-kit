// web/src/features/tenant-admin/usuarios/pages/NovoUsuarioPage.tsx

import { useNavigate } from "react-router-dom";
import { UsuarioActionGuard } from "../components/usuarioActionGuard";
import { UsuarioForm } from "../components/usuarioForm";
import { useSalvarUsuario } from "../hooks/useSalvarUsuario";
import type { CriarUsuarioInput } from "../tipos";

export default function NovoUsuarioPage() {
  const navigate = useNavigate();
  const { salvar, isSaving, erro } = useSalvarUsuario({
    mode: "create",
    onSuccess: () => navigate("/app/usuarios"),
  });

  async function handleSubmit(input: CriarUsuarioInput) {
    await salvar(input as CriarUsuarioInput);
  }

  return (
    <UsuarioActionGuard
      action="criar"
      fallback={
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Você não possui permissão para criar usuários.
        </div>
      }
    >
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Novo usuário</h1>
          <p className="text-sm text-slate-600">
            Cadastre um novo usuário do locatário.
          </p>
        </div>

        <UsuarioForm
          mode="create"
          isSaving={isSaving}
          erro={erro}
          onSubmit={handleSubmit}
        />
      </div>
    </UsuarioActionGuard>
  );
}