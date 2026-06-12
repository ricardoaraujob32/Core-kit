// apps/web/src/features/superadmin/locatarios/components/LocatarioModulosForm.tsx

import { useState } from "react";
import type { ModuloAssinaturaLocatario } from "../api/locatarioConfiguracoesApi";

type Props = {
  modulos: ModuloAssinaturaLocatario[];
  isRunning: boolean;
  onVincular: (codigo: string) => void | Promise<void>;
  onDesvincular: (codigo: string) => void | Promise<void>;
};

const MODULOS_SUGERIDOS = ["ASSINATURAS", "USUARIOS", "VENDAS", "COMPRAS", "ESTOQUE", "FINANCEIRO", "ORDENS_SERVICO"];

export function LocatarioModulosForm({ modulos, isRunning, onVincular, onDesvincular }: Props) {
  const [codigo, setCodigo] = useState("");
  const modulosAtuais = new Set(modulos.map((modulo) => modulo.codigo));
  const disponiveis = MODULOS_SUGERIDOS.filter((modulo) => !modulosAtuais.has(modulo));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onVincular(codigo);
    setCodigo("");
  }

  return (
    <div className="grid gap-4 rounded-2xl border bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold">Módulos da assinatura</h2>
        <p className="text-sm text-slate-600">Acrescente ou remova módulos disponíveis para o locatário.</p>
      </div>

      <form className="flex flex-wrap gap-3" onSubmit={handleSubmit}>
        <input className="rounded-xl border px-3 py-2" placeholder="Código do módulo" value={codigo} onChange={(event) => setCodigo(event.target.value)} list="modulos-disponiveis" />
        <datalist id="modulos-disponiveis">{disponiveis.map((modulo) => <option key={modulo} value={modulo} />)}</datalist>
        <button className="rounded-xl border px-4 py-2" type="submit" disabled={isRunning}>Adicionar módulo</button>
      </form>

      {modulos.length === 0 ? (
        <div className="rounded-xl border p-4 text-sm text-slate-600">Nenhum módulo vinculado.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left"><th className="px-4 py-3">Código</th><th className="px-4 py-3">Origem</th><th className="px-4 py-3">Ações</th></tr>
            </thead>
            <tbody>
              {modulos.map((modulo) => (
                <tr key={modulo.codigo} className="border-b last:border-b-0">
                  <td className="px-4 py-3">{modulo.codigo}</td><td className="px-4 py-3">{modulo.origem ?? "—"}</td>
                  <td className="px-4 py-3"><button className="text-red-600 underline disabled:opacity-50" type="button" disabled={isRunning} onClick={() => void onDesvincular(modulo.codigo)}>Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {disponiveis.length > 0 ? <div className="text-sm text-slate-600"><strong>Sugestões disponíveis:</strong> {disponiveis.join(", ")}</div> : null}
    </div>
  );
}
