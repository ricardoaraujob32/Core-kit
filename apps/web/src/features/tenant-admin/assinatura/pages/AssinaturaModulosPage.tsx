// apps/web/src/features/tenant-admin/assinatura/pages/AssinaturaModulosPage.tsx

import { PageGuard } from "../../../../core/routing/pageGuard";
import { useAuthorization } from "../../../../core/auth/useAuthorization";
import { AssinaturaModulosTable } from "../components/AssinaturaModulosTable";
import { VincularModuloForm } from "../components/VincularModuloForm";
import { useAssinaturaModuloActions } from "../hooks/useAssinaturaModuloActions";
import { useAssinaturaModulos } from "../hooks/useAssinaturaModulos";

const ASSINATURAS_MODULE = "ASSINATURAS";

const ASSINATURAS_PERMISSIONS = {
  LER: "tenant.assinatura.ler",
  ATUALIZAR: "tenant.assinatura.atualizar",
} as const;

export default function AssinaturaModulosPage() {
  const { hasPermission, hasModule } = useAuthorization();

  const {
    locatarioId,
    modulos,
    isLoading,
    erro,
    recarregar,
  } = useAssinaturaModulos();

  const {
    vincular,
    desvincular,
    isRunning,
    erro: erroAcao,
    sucesso,
  } = useAssinaturaModuloActions({
    onSuccess: recarregar,
  });

  const podeAtualizar =
    hasModule(ASSINATURAS_MODULE) &&
    hasPermission(ASSINATURAS_PERMISSIONS.ATUALIZAR);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        Carregando módulos da assinatura...
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Módulos da assinatura</h1>
        <p className="text-sm text-slate-600">
          Consulte e gerencie os módulos habilitados para o locatário.
        </p>
      </div>

      {locatarioId ? (
        <div className="rounded-2xl border bg-white p-4 text-sm">
          <strong>Locatário:</strong> {locatarioId}
        </div>
      ) : null}

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      {erroAcao ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erroAcao}
        </div>
      ) : null}

      {sucesso ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {sucesso}
        </div>
      ) : null}

      <PageGuard
        requiredModule={ASSINATURAS_MODULE}
        requiredPermissions={[ASSINATURAS_PERMISSIONS.LER]}
        fallback={
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Você não possui permissão para consultar os módulos da assinatura.
          </div>
        }
      >
        <div className="flex gap-3">
          <button
            className="rounded-xl border px-4 py-2"
            type="button"
            onClick={() => void recarregar()}
          >
            Recarregar
          </button>
        </div>

        <AssinaturaModulosTable
          modulos={modulos}
          podeAtualizar={podeAtualizar}
          isRunning={isRunning !== null}
          onDesvincular={(moduloId) => void desvincular(moduloId)}
        />
      </PageGuard>

      <PageGuard
        requiredModule={ASSINATURAS_MODULE}
        requiredPermissions={[ASSINATURAS_PERMISSIONS.ATUALIZAR]}
        fallback={
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Você não possui permissão para alterar módulos da assinatura.
          </div>
        }
      >
        <VincularModuloForm
          isSaving={isRunning === "vincular"}
          onSubmit={(moduloId) => void vincular(moduloId)}
        />
      </PageGuard>
    </div>
  );
}