// apps/web/src/features/superadmin/locatarios/pages/EditarLocatarioPage.tsx

import { useNavigate, useParams } from "react-router-dom";
import { LocatarioBrandingForm } from "../components/LocatarioBrandingForm";
import { LocatarioForm } from "../components/LocatarioForm";
import { LocatarioModulosForm } from "../components/LocatarioModulosForm";
import { useLocatario } from "../hooks/useLocatario";
import { useLocatarioConfiguracoes } from "../hooks/useLocatarioConfiguracoes";
import { useLocatarioConfiguracoesActions } from "../hooks/useLocatarioConfiguracoesActions";
import { useSalvarLocatario } from "../hooks/useSalvarLocatario";
import type { AtualizarLocatarioInput } from "../tipos";

export default function EditarLocatarioPage() {
  const navigate = useNavigate();
  const params = useParams<{ locatarioId: string }>();
  const locatarioId = params.locatarioId?.trim();

  const { item, isLoading, erro: erroCarga } = useLocatario(locatarioId);
  const { branding, modulos, isLoading: isLoadingConfiguracoes, erro: erroConfiguracoes, recarregar: recarregarConfiguracoes } = useLocatarioConfiguracoes(locatarioId);
  const { atualizarBranding, vincularModulo, desvincularModulo, isRunning, erro: erroAcaoConfiguracao, sucesso } = useLocatarioConfiguracoesActions({ locatarioId, onSuccess: recarregarConfiguracoes });

  const { salvar, isSaving, erro } = useSalvarLocatario({
    mode: "edit",
    locatarioId,
    onSuccess: (id) => navigate(id ? `/plataforma/locatarios/${id}` : "/plataforma/locatarios"),
  });

  async function handleSubmit(input: AtualizarLocatarioInput) {
    await salvar(input);
  }

  if (isLoading) return <div className="rounded-2xl border bg-white p-6">Carregando locatário...</div>;
  if (erroCarga) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroCarga}</div>;
  if (!item) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Locatário não encontrado.</div>;

  return (
    <div className="grid gap-6">
      <div><h1 className="text-2xl font-semibold">Editar locatário</h1><p className="text-sm text-slate-600">Atualize cadastro, branding e módulos da assinatura.</p></div>

      <LocatarioForm mode="edit" initialData={item} isSaving={isSaving} erro={erro} onSubmit={handleSubmit} />

      {erroConfiguracoes ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroConfiguracoes}</div> : null}
      {erroAcaoConfiguracao ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroAcaoConfiguracao}</div> : null}
      {sucesso ? <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{sucesso}</div> : null}

      {isLoadingConfiguracoes ? (
        <div className="rounded-2xl border bg-white p-6">Carregando configurações...</div>
      ) : (
        <>
          <LocatarioBrandingForm branding={branding} isSaving={isRunning === "branding"} onSubmit={(input) => void atualizarBranding(input)} />
          <LocatarioModulosForm modulos={modulos} isRunning={isRunning !== null} onVincular={(codigo) => void vincularModulo(codigo)} onDesvincular={(codigo) => void desvincularModulo(codigo)} />
        </>
      )}
    </div>
  );
}
