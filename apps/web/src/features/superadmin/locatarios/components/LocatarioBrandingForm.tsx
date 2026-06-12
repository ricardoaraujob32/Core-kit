// apps/web/src/features/superadmin/locatarios/components/LocatarioBrandingForm.tsx

import { useEffect, useState } from "react";
import type { AtualizarBrandingLocatarioInput, BrandingLocatario } from "../api/locatarioConfiguracoesApi";

type Props = {
  branding: BrandingLocatario | null;
  isSaving: boolean;
  onSubmit: (input: AtualizarBrandingLocatarioInput) => void | Promise<void>;
};

export function LocatarioBrandingForm({ branding, isSaving, onSubmit }: Props) {
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("");
  const [corSecundaria, setCorSecundaria] = useState("");
  const [corFundo, setCorFundo] = useState("");
  const [corTexto, setCorTexto] = useState("");

  useEffect(() => {
    setNomeFantasia(branding?.identidadeVisual ?? "");
    setLogoUrl(branding?.urlLogo ?? "");
    setCorPrimaria(branding?.corPrimaria ?? "");
    setCorSecundaria(branding?.corSecundaria ?? "");
    setCorFundo(branding?.corTerciaria ?? "");
  }, [branding]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      nomeFantasia: nomeFantasia.trim() || null,
      logoUrl: logoUrl.trim() || null,
      corPrimaria: corPrimaria.trim() || null,
      corSecundaria: corSecundaria.trim() || null,
      corFundo: corFundo.trim() || null,
      corTexto: corTexto.trim() || null,
    });
  }

  return (
    <form className="grid gap-4 rounded-2xl border bg-white p-6" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-semibold">Branding</h2>
        <p className="text-sm text-slate-600">Atualize as informações visuais usadas pelo locatário.</p>
      </div>
      <input className="rounded-xl border px-3 py-2" placeholder="Nome fantasia" value={nomeFantasia} onChange={(event) => setNomeFantasia(event.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="URL do logo" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Cor primária. Ex.: #2563eb" value={corPrimaria} onChange={(event) => setCorPrimaria(event.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Cor secundária. Ex.: #1d4ed8" value={corSecundaria} onChange={(event) => setCorSecundaria(event.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Cor de fundo. Ex.: #ffffff" value={corFundo} onChange={(event) => setCorFundo(event.target.value)} />
      <input className="rounded-xl border px-3 py-2" placeholder="Cor do texto. Ex.: #111827" value={corTexto} onChange={(event) => setCorTexto(event.target.value)} />
      <div className="flex justify-end">
        <button className="rounded-xl border px-4 py-2" type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar branding"}</button>
      </div>
    </form>
  );
}
