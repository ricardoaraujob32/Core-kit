// apps/web/src/features/tenant-admin/locatario/pages/ConfiguracoesLocatarioPage.tsx

import { useMemo, useState } from "react";
import { useAuth } from "../../../../core/auth/useAuth";
import { ConfiguracaoLocatarioForm } from "../components/ConfiguracaoLocatarioForm";
import { ConfiguracoesLocatarioTable } from "../components/ConfiguracoesLocatarioTable";
import { useAtivarConfiguracaoLocatario } from "../hooks/useAtivarConfiguracaoLocatario";
import { useConfiguracoesLocatario } from "../hooks/useConfiguracoesLocatario";
import { useSalvarConfiguracaoLocatario } from "../hooks/useSalvarConfiguracaoLocatario";
import type { AtualizarConfiguracaoLocatarioInput, ConfiguracaoLocatario, CriarConfiguracaoLocatarioInput } from "../tipos";

export default function ConfiguracoesLocatarioPage() {
  const { itens, configuracaoAtiva, isLoading, erro, recarregar } =
    useConfiguracoesLocatario();

  const [modoFormulario, setModoFormulario] = useState<"create" | "edit">("create");
  const [configuracaoEmEdicao, setConfiguracaoEmEdicao] =
    useState<ConfiguracaoLocatario | null>(null);

  const { salvar, isSaving, erro: erroSalvar } = useSalvarConfiguracaoLocatario({
    mode: modoFormulario,
    configuracaoId: configuracaoEmEdicao?.configuracaoId,
    onSuccess: async () => {
      setModoFormulario("create");
      setConfiguracaoEmEdicao(null);
      await recarregar();
    },
  });

  const { ativar, isRunning, erro: erroAtivar } = useAtivarConfiguracaoLocatario(
    async () => {
      await recarregar();
    },
  );

  const erroGeral = erro ?? erroSalvar ?? erroAtivar;

  const configuracaoAtivaId = useMemo(
    () => configuracaoAtiva?.configuracaoId ?? null,
    [configuracaoAtiva],
  );

  async function handleCreateOrUpdate(
    input:
      | CriarConfiguracaoLocatarioInput
      | AtualizarConfiguracaoLocatarioInput,
  ) {
    await salvar(input);
  }

  function handleEditar(configuracao: ConfiguracaoLocatario) {
    setModoFormulario("edit");
    setConfiguracaoEmEdicao(configuracao);
  }

  function handleNova() {
    setModoFormulario("create");
    setConfiguracaoEmEdicao(null);
  }

  if (isLoading) {
    return <div className="rounded-2xl border bg-white p-6">Carregando configurações...</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Configurações do locatário</h1>
          <p className="text-sm text-slate-600">
            Gerencie identidades visuais e ative a configuração desejada.
          </p>
        </div>

        <button
          className="rounded-xl border px-4 py-2"
          type="button"
          onClick={handleNova}
        >
          Nova configuração
        </button>
      </div>

      {configuracaoAtiva ? (
        <div className="rounded-2xl border bg-white p-4 text-sm">
          <strong>Configuração ativa:</strong> {configuracaoAtiva.identidadeVisual}
        </div>
      ) : null}

      {erroGeral ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erroGeral}
        </div>
      ) : null}

      <ConfiguracoesLocatarioTable
        itens={itens}
        configuracaoAtivaId={configuracaoAtivaId}
        isRunning={isRunning}
        onEditar={handleEditar}
        onAtivar={(configuracaoId) => void ativar(configuracaoId)}
      />

      <ConfiguracaoLocatarioForm
        mode={modoFormulario}
        initialData={configuracaoEmEdicao}
        isSaving={isSaving}
        erro={erroSalvar}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
}
