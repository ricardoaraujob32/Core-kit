// apps/web/src/features/tenant-admin/locatario/components/ConfiguracoesLocatarioTable.tsx

import type { ConfiguracaoLocatario } from "../tipos";

type Props = {
  itens: ConfiguracaoLocatario[];
  configuracaoAtivaId?: string | null;
  isRunning?: boolean;
  onEditar: (configuracao: ConfiguracaoLocatario) => void;
  onAtivar: (configuracaoId: string) => void;
};

export function ConfiguracoesLocatarioTable({ itens, configuracaoAtivaId, isRunning, onEditar, onAtivar }: Props) {
  if (itens.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhuma configuração cadastrada.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-4 py-3">Identidade visual</th>
            <th className="px-4 py-3">Tema</th>
            <th className="px-4 py-3">Ativa</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => {
            const ativa = configuracaoAtivaId === item.configuracaoId || item.ativa;

            return (
              <tr key={item.configuracaoId} className="border-b last:border-b-0">
                <td className="px-4 py-3">{item.identidadeVisual}</td>
                <td className="px-4 py-3">{item.modoTema ?? "SISTEMA"}</td>
                <td className="px-4 py-3">{ativa ? "Sim" : "Não"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      className="text-blue-600 underline"
                      type="button"
                      onClick={() => onEditar(item)}
                    >
                      Editar
                    </button>

                    {!ativa ? (
                      <button
                        className="text-blue-600 underline"
                        type="button"
                        onClick={() => onAtivar(item.configuracaoId)}
                        disabled={Boolean(isRunning)}
                      >
                        Ativar
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
