
import { useNavigate } from "react-router-dom";
import { UsuarioForm } from "../components/UsuarioForm";
import { useSalvarUsuario } from "../hooks/useSalvarUsuario";
import type { CriarUsuarioInput } from "../types";

export default function NovoUsuarioPage() {
  const navigate = useNavigate();
  const { salvar, isSaving, erro } = useSalvarUsuario({
    mode: "create",
    onSuccess: () => navigate("/tenant/usuarios"),
  });

  async function handleSubmit(input: CriarUsuarioInput) {
    await salvar(input);
  }

  return (
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
  );
}
