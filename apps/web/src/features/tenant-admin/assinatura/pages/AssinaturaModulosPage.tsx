// apps/web/src/features/tenant-admin/assinatura/pages/AssinaturaModulosPage.tsx

import { useAuthorization } from "../../../../core/auth/useAuthorization";
import { VincularModuloForm } from "../components/VincularModuloForm";
import { useAssinaturaModuloActions } from "../hooks/useAssinaturaModuloActions";
import { useAssinaturaModulos } from "../hooks/useAssinaturaModulos";

const ASSINATURAS_MODULE = "ASSINATURAS";

const ASSINATURAS_PERMISSIONS = {
  ATUALIZAR: "tenant.assinatura.atualizar",
} as const;

type ModuloAssinatura = {
  codigo: string;
  origem?: string | null;
};

type AssinaturaModulosTableProps = {
  modulos: ModuloAssinatura[];
  podeAtualizar: boolean;
  isRunning: boolean;
  onDesvincular: (moduloId: string) => void;
};

function AssinaturaModulosTableLocal({
  modulos,
  podeAtualizar,
  isRunning,
  onDesvincular,
}: AssinaturaModulosTableProps) {
  if (modulos.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhum módulo habilitado para este locatário.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Origem</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>

        <tbody>
          {modulos.map((modulo) => (
            <tr key={modulo.codigo} className="border-b last:border-b-0">
              <td className="px-4 py-3 font-medium">{modulo.codigo}</td>
              <td className="px-4 py-3">{modulo.origem ?? "—"}</td>
              <td className="px-4 py-3">
                {podeAtualizar ? (
                  <button
                    className="text-red-600 underline disabled:opacity-50"
                    type="button"
                    disabled={isRunning}
                    onClick={() => onDesvincular(modulo.codigo)}
                  >
                    Desvincular
                  </button>
                ) : (
                  <span className="text-slate-500">Sem permissão</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
          Consulte os módulos habilitados para o locatário.
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

      <div className="flex gap-3">
        <button
          className="rounded-xl border px-4 py-2"
          type="button"
          onClick={() => void recarregar()}
        >
          Recarregar
        </button>
      </div>

      <AssinaturaModulosTableLocal
        modulos={modulos}
        podeAtualizar={podeAtualizar}
        isRunning={isRunning !== null}
        onDesvincular={(moduloId) => void desvincular(moduloId)}
      />

      {podeAtualizar ? (
        <VincularModuloForm
          isSaving={isRunning === "vincular"}
          onSubmit={(moduloId) => void vincular(moduloId)}
        />
      ) : null}
    </div>
  );
}