// apps/web/src/features/superadmin/locatarios/components/LocatarioModulosResumo.tsx

import type { ModuloAssinaturaLocatario } from "../api/locatarioConfiguracoesApi";

type Props = { modulos: ModuloAssinaturaLocatario[] };

export function LocatarioModulosResumo({ modulos }: Props) {
  if (modulos.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhum módulo de assinatura vinculado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <div className="border-b bg-slate-50 px-4 py-3">
        <h2 className="text-lg font-semibold">Módulos da assinatura</h2>
      </div>
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Origem</th>
          </tr>
        </thead>
        <tbody>
          {modulos.map((modulo) => (
            <tr key={modulo.codigo} className="border-b last:border-b-0">
              <td className="px-4 py-3">{modulo.codigo}</td>
              <td className="px-4 py-3">{modulo.origem ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
