// apps/web/src/features/tenant-admin/assinatura/components/AssinaturaModulosTable.tsx

import type { ModuloAssinatura } from "../tipos";

type Props = {
  modulos: ModuloAssinatura[];
  podeAtualizar?: boolean;
  isRunning?: boolean;
  onDesvincular?: (moduloCodigo: string) => void;
};

export function AssinaturaModulosTable({ modulos, podeAtualizar, isRunning, onDesvincular }: Props) {
  if (modulos.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhum módulo habilitado nesta assinatura.
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
              <td className="px-4 py-3">{modulo.codigo}</td>
              <td className="px-4 py-3">{modulo.origem}</td>
              <td className="px-4 py-3">
                {podeAtualizar ? (
                  <button
                    type="button"
                    className="text-red-700 underline"
                    disabled={Boolean(isRunning)}
                    onClick={() => onDesvincular?.(modulo.codigo)}
                  >
                    Desvincular
                  </button>
                ) : (
                  <span className="text-xs text-slate-500">
                    Sem permissão de alteração
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}