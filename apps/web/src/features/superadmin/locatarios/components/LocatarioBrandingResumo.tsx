// apps/web/src/features/superadmin/locatarios/components/LocatarioBrandingResumo.tsx

import type { BrandingLocatario } from "../api/locatarioConfiguracoesApi";

type Props = { branding: BrandingLocatario | null };

export function LocatarioBrandingResumo({ branding }: Props) {
  if (!branding) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        Nenhuma configuração de branding encontrada.
      </div>
    );
  }

  return (
    <div className="grid gap-2 rounded-2xl border bg-white p-6 text-sm">
      <h2 className="text-lg font-semibold">Branding</h2>
      <div><strong>Nome fantasia:</strong> {branding.identidadeVisual ?? "—"}</div>
      <div><strong>Logo:</strong> {branding.urlLogo ?? "—"}</div>
      <div><strong>Cor primária:</strong> {branding.corPrimaria ?? "—"}</div>
      <div><strong>Cor secundária:</strong> {branding.corSecundaria ?? "—"}</div>
      <div><strong>Cor terciária:</strong> {branding.corTerciaria ?? "—"}</div>
      <div><strong>Modo de tema:</strong> {branding.modoTema ?? "—"}</div>
      <div><strong>Atualizado em:</strong> {branding.atualizadoEm ?? "—"}</div>
    </div>
  );
}
