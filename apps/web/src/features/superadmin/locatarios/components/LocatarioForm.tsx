// apps/web/src/features/superadmin/locatarios/components/LocatarioForm.tsx

import { useEffect, useMemo, useState } from "react";
import type { AtualizarLocatarioInput, CriarLocatarioInput, Locatario, ModoTema } from "../tipos";

type Props = {
  mode: "create" | "edit";
  initialData?: Locatario | null;
  isSaving?: boolean;
  erro?: string | null;
  onSubmit: (
    input: CriarLocatarioInput | AtualizarLocatarioInput,
  ) => void | Promise<void>;
};

export function LocatarioForm({
  mode,
  initialData,
  isSaving,
  erro,
  onSubmit,
}: Props) {
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [fusoHorario, setFusoHorario] = useState("America/Sao_Paulo");

  const [modoTema, setModoTema] = useState<ModoTema>("SISTEMA");
  const [identidadeVisual, setIdentidadeVisual] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("");
  const [corSecundaria, setCorSecundaria] = useState("");
  const [corTerciaria, setCorTerciaria] = useState("");
  const [urlLogo, setUrlLogo] = useState("");

  useEffect(() => {
    if (!initialData) return;

    setNome(initialData.nome ?? "");
    setSlug(initialData.slug ?? "");
    setEmail(initialData.email ?? "");
    setDocumento(initialData.documento ?? "");
    setFusoHorario(initialData.fusoHorario ?? "America/Sao_Paulo");
  }, [initialData]);

  const titulo = useMemo(
    () => (mode === "create" ? "Novo locatário" : "Editar locatário"),
    [mode],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "create") {
      await onSubmit({
        nome: nome.trim(),
        slug: slug.trim(),
        email: email.trim(),
        documento: documento.trim() || null,
        fusoHorario: fusoHorario.trim() || undefined,
        configuracaoInicial: {
          modoTema,
          identidadeVisual: identidadeVisual.trim(),
          corPrimaria: corPrimaria.trim() || null,
          corSecundaria: corSecundaria.trim() || null,
          corTerciaria: corTerciaria.trim() || null,
          urlLogo: urlLogo.trim() || null,
          ativa: true,
        },
      });

      return;
    }

    await onSubmit({
      nome: nome.trim() || undefined,
      email: email.trim() || undefined,
      documento: documento.trim() || null,
      fusoHorario: fusoHorario.trim() || undefined,
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
        <span className="text-sm font-medium">Nome</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          required
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Slug</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required={mode === "create"}
          disabled={mode === "edit"}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">E-mail</span>
        <input
          className="rounded-xl border px-3 py-2"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Documento</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={documento}
          onChange={(event) => setDocumento(event.target.value)}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Fuso horário</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={fusoHorario}
          onChange={(event) => setFusoHorario(event.target.value)}
        />
      </label>

      {mode === "create" ? (
        <>
          <hr className="my-2" />

          <div>
            <h3 className="text-base font-semibold">Configuração inicial</h3>
          </div>

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
        </>
      ) : null}

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