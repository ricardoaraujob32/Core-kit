
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usuariosApi } from "../api/usuariosApi";
import { UsuarioDetailsCard } from "../components/UsuarioDetailsCard";
import { useUsuarioActions } from "../hooks/useUsuarioActions";
import type { Usuario } from "../types";

export default function UsuarioDetailsPage() {
  const navigate = useNavigate();
  const { usuarioId = "" } = useParams<{ usuarioId: string }>();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  async function carregar() {
    setIsLoading(true);
    setErroCarga(null);

    try {
      const response = await usuariosApi.obter(usuarioId);
      setUsuario(response.item);
    } catch {
      setErroCarga("Não foi possível carregar o usuário.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, [usuarioId]);

  const { inativar, reativar, erro } = useUsuarioActions({
    onSuccess: carregar,
  });

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
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{usuario.nome}</h1>
          <p className="text-sm text-slate-600">{usuario.email}</p>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-xl border px-4 py-2 font-medium"
            onClick={() => navigate(`/tenant/usuarios/${usuario.usuarioId}/editar`)}
          >
            Editar
          </button>

          {usuario.status === "ATIVO" ? (
            <button
              className="rounded-xl border px-4 py-2 font-medium"
              onClick={() => void inativar(usuario.usuarioId)}
            >
              Inativar
            </button>
          ) : (
            <button
              className="rounded-xl border px-4 py-2 font-medium"
              onClick={() => void reativar(usuario.usuarioId)}
            >
              Reativar
            </button>
          )}
        </div>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      <UsuarioDetailsCard usuario={usuario} />
    </div>
  );
}
