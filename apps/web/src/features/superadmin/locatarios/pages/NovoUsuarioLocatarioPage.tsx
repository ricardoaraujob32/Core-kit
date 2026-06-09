// apps/web/src/features/superadmin/locatarios/pages/NovoUsuarioLocatarioPage.tsx

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { UsuarioForm } from "../../../tenant-admin/usuarios";
import type { AtualizarUsuarioInput, CriarUsuarioInput } from "../../../tenant-admin/usuarios";
import { usuariosLocatarioApi } from "../api/usuariosLocatarioApi";

export default function NovoUsuarioLocatarioPage() {
  const navigate = useNavigate();
  const params = useParams<{ locatarioId: string }>();
  const locatarioId = params.locatarioId?.trim();
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  async function handleSubmit(input: CriarUsuarioInput | AtualizarUsuarioInput) {
    if (!locatarioId) { setErro("ID do locatário inválido."); return; }
    setIsSaving(true); setErro(null);
    try { await usuariosLocatarioApi.criar(locatarioId, input as CriarUsuarioInput); navigate(`/plataforma/locatarios/${locatarioId}`, { replace: true }); }
    catch (error) { setErro(mapError(error).message); }
    finally { setIsSaving(false); }
  }
  if (!locatarioId) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">ID do locatário inválido.</div>;
  return <div className="grid gap-6"><div><h1 className="text-2xl font-semibold">Novo usuário do locatário</h1><p className="text-sm text-slate-600">Cadastre um usuário diretamente pela área da plataforma.</p></div><div><Link className="text-blue-600 underline" to={`/plataforma/locatarios/${locatarioId}`}>Voltar ao locatário</Link></div><UsuarioForm mode="create" isSaving={isSaving} erro={erro} onSubmit={handleSubmit} /></div>;
}
