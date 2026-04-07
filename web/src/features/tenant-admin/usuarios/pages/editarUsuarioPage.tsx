// web/src/features/tenant-admin/usuarios/pages/editarUsuarioPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usuariosApi } from "../api/usuariosApi";
import { UsuarioActionGuard } from "../components/usuarioActionGuard";
import { UsuarioForm } from "../components/usuarioForm";
import type { AtualizarUsuarioInput, Usuario } from "../tipos";
import { useSalvarUsuario } from "../hooks/useSalvarUsuario";

export default function EditarUsuarioPage() {
  const navigate = useNavigate();
  const { usuarioId = "" } = useParams<{ usuarioId: string }>();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const { salvar, isSaving, erro } = useSalvarUsuario({
    mode: "edit",
    usuarioId,
    onSuccess: () => navigate(`/app/usuarios/${usuarioId}`),
  });

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setIsLoading(true);
      setErroCarga(null);

      try {
        const response = await usuariosApi.obter(usuarioId);
        if (ativo) {
          setUsuario(response.item);
        }
      } catch {
        if (ativo) {
          setErroCarga("Não foi possível carregar o usuário.");
        }
      } finally {
        if (ativo) {
          setIsLoading(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  async function handleSubmit(input: AtualizarUsuarioInput) {
    await salvar(input);
  }

  if (isLoading) {
    return <div className="rounded-2xl border bg-white p-6">Carregando usuário...</div>;
  }

  if (erroCarga || !usuario) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {erroCarga ?? "Usuário não encontrado."}
      </div>
    );
  }

  return (
    <UsuarioActionGuard
      action="editar"
      fallback={
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Você não possui permissão para editar usuários.
        </div>
      }
    >
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Editar usuário</h1>
          <p className="text-sm text-slate-600">
            Atualize nome e e-mail do usuário.
          </p>
        </div>

        <UsuarioForm
          mode="edit"
          initialData={usuario}
          isSaving={isSaving}
          erro={erro}
          onSubmit={handleSubmit}
        />
      </div>
    </UsuarioActionGuard>
  );
}
