// apps/web/src/features/tenant-admin/locatario/components/ConfiguracaoLocatarioForm.tsx

import { useEffect, useMemo, useState } from "react";
import type { AtualizarConfiguracaoLocatarioInput, ConfiguracaoLocatario, CriarConfiguracaoLocatarioInput, ModoTema } from "../tipos";

type Props = {
  mode: "create" | "edit";
  initialData?: ConfiguracaoLocatario | null;
  isSaving?: boolean;
  erro?: string | null;
  onSubmit: (
    input:
      | CriarConfiguracaoLocatarioInput
      | AtualizarConfiguracaoLocatarioInput,
  ) => void | Promise<void>;
};

export function ConfiguracaoLocatarioForm({
  mode,
  initialData,
  isSaving,
  erro,
  onSubmit,
}: Props) {
  const [modoTema, setModoTema] = useState<ModoTema>("SISTEMA");
  const [identidadeVisual, setIdentidadeVisual] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("");
  const [corSecundaria, setCorSecundaria] = useState("");
  const [corTerciaria, setCorTerciaria] = useState("");
  const [urlLogo, setUrlLogo] = useState("");

  useEffect(() => {
    if (!initialData) return;

    setModoTema(initialData.modoTema ?? "SISTEMA");
    setIdentidadeVisual(initialData.identidadeVisual ?? "");
    setCorPrimaria(initialData.corPrimaria ?? "");
    setCorSecundaria(initialData.corSecundaria ?? "");
    setCorTerciaria(initialData.corTerciaria ?? "");
    setUrlLogo(initialData.urlLogo ?? "");
  }, [initialData]);

  const titulo = useMemo(
    () =>
      mode === "create"
        ? "Nova configuração visual"
        : "Editar configuração visual",
    [mode],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "create") {
      await onSubmit({
        modoTema,
        identidadeVisual: identidadeVisual.trim(),
        corPrimaria: corPrimaria.trim() || null,
        corSecundaria: corSecundaria.trim() || null,
        corTerciaria: corTerciaria.trim() || null,
        urlLogo: urlLogo.trim() || null,
        ativa: false,
      });
      return;
    }

    await onSubmit({
      modoTema,
      identidadeVisual: identidadeVisual.trim() || undefined,
      corPrimaria: corPrimaria.trim() || null,
      corSecundaria: corSecundaria.trim() || null,
      corTerciaria: corTerciaria.trim() || null,
      urlLogo: urlLogo.trim() || null,
    });
  }

  return (
    <form
      className="grid gap-4 rounded-2xl border bg-white p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="text-lg font-semibold">{titulo}</h2>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      <label className="grid gap-1">
        <span className="text-sm font-medium">Modo de tema</span>
        <select
          className="rounded-xl border px-3 py-2"
          value={modoTema}
          onChange={(event) => setModoTema(event.target.value as ModoTema)}
        >
          <option value="SISTEMA">Sistema</option>
          <option value="CLARO">Claro</option>
          <option value="ESCURO">Escuro</option>
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Identidade visual</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={identidadeVisual}
          onChange={(event) => setIdentidadeVisual(event.target.value)}
          required
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Cor primária</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={corPrimaria}
          onChange={(event) => setCorPrimaria(event.target.value)}
          placeholder="#2563eb"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Cor secundária</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={corSecundaria}
          onChange={(event) => setCorSecundaria(event.target.value)}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Cor terciária</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={corTerciaria}
          onChange={(event) => setCorTerciaria(event.target.value)}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">URL da logo</span>
        <input
          className="rounded-xl border px-3 py-2"
          type="url"
          value={urlLogo}
          onChange={(event) => setUrlLogo(event.target.value)}
        />
      </label>

      <div className="flex justify-end">
        <button
          className="rounded-xl border px-4 py-2 font-medium"
          type="submit"
          disabled={Boolean(isSaving)}
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
