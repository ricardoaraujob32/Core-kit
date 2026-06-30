// apps/web/src/features/superadmin/locatarios/components/LocatarioForm.tsx

import { useMemo, useState, type FormEvent } from "react";
import { SuperAdminButton, SuperAdminCard } from "../../shared";
import type { AtualizarLocatarioInput, CriarLocatarioInput, Locatario, ModoTema } from "../tipos";
import "../../shared/superAdminPages.css";

type Props = {
  mode: "create" | "edit";
  initialData?: Locatario | null;
  isSaving?: boolean;
  erro?: string | null;
  onSubmit: (
    input: CriarLocatarioInput | AtualizarLocatarioInput,
  ) => void | Promise<void>;
};

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function LocatarioForm({
  mode,
  initialData,
  isSaving,
  erro,
  onSubmit,
}: Props) {
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [documento, setDocumento] = useState(initialData?.documento ?? "");
  const [fusoHorario, setFusoHorario] = useState(
    initialData?.fusoHorario ?? "America/Sao_Paulo",
  );

  const [identidadeVisual, setIdentidadeVisual] = useState(
    initialData?.nome ?? "",
  );
  const [modoTema, setModoTema] = useState<ModoTema>("CLARO");
  const [corPrimaria, setCorPrimaria] = useState("#2563eb");
  const [corSecundaria, setCorSecundaria] = useState("#1d4ed8");
  const [corTerciaria, setCorTerciaria] = useState("#111827");
  const [urlLogo, setUrlLogo] = useState("");

  const titulo = useMemo(
    () => (mode === "create" ? "Novo locatário" : "Editar locatário"),
    [mode],
  );

  const descricao = useMemo(
    () =>
      mode === "create"
        ? "Cadastre uma nova empresa/tenant da plataforma."
        : "Atualize os dados principais do locatário.",
    [mode],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "create") {
      await onSubmit({
        nome: nome.trim(),
        slug: slug.trim(),
        email: email.trim(),
        documento: normalizeOptionalText(documento),
        fusoHorario: fusoHorario.trim() || "America/Sao_Paulo",
        configuracaoInicial: {
          modoTema,
          identidadeVisual: identidadeVisual.trim() || nome.trim(),
          corPrimaria: normalizeOptionalText(corPrimaria),
          corSecundaria: normalizeOptionalText(corSecundaria),
          corTerciaria: normalizeOptionalText(corTerciaria),
          urlLogo: normalizeOptionalText(urlLogo),
          ativa: true,
        },
      });

      return;
    }

    await onSubmit({
      nome: nome.trim(),
      email: email.trim(),
      documento: normalizeOptionalText(documento),
      fusoHorario: fusoHorario.trim() || "America/Sao_Paulo",
    });
  }

  return (
    <form className="ck-superadmin-page" onSubmit={handleSubmit}>
      <header className="ck-superadmin-page__header">
        <div>
          <p className="ck-superadmin-page__kicker">Locatários</p>
          <h1>{titulo}</h1>
          <p>{descricao}</p>
        </div>
      </header>

      {erro ? (
        <SuperAdminCard title="Erro ao salvar">
          {erro}
        </SuperAdminCard>
      ) : null}

      <SuperAdminCard
        title="Dados principais"
        description="Informações de identificação e acesso do locatário."
      >
        <div className="ck-superadmin-form-grid">
          <label className="ck-superadmin-field ck-superadmin-field--wide">
            <span>Nome</span>
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Loja Modelo"
              required
            />
          </label>

          <label className="ck-superadmin-field">
            <span>Slug</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="Ex.: loja"
              disabled={mode === "edit"}
              required={mode === "create"}
            />
          </label>

          <label className="ck-superadmin-field">
            <span>E-mail administrativo</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@empresa.com"
              required
            />
          </label>

          <label className="ck-superadmin-field">
            <span>Documento</span>
            <input
              value={documento}
              onChange={(event) => setDocumento(event.target.value)}
              placeholder="CNPJ, CPF ou identificador"
            />
          </label>

          <label className="ck-superadmin-field">
            <span>Fuso horário</span>
            <input
              value={fusoHorario}
              onChange={(event) => setFusoHorario(event.target.value)}
              placeholder="America/Sao_Paulo"
            />
          </label>
        </div>
      </SuperAdminCard>

      {mode === "create" ? (
        <SuperAdminCard
          title="Configuração inicial"
          description="Identidade visual inicial criada junto com o locatário."
        >
          <div className="ck-superadmin-form-grid">
            <label className="ck-superadmin-field ck-superadmin-field--wide">
              <span>Identidade visual</span>
              <input
                value={identidadeVisual}
                onChange={(event) => setIdentidadeVisual(event.target.value)}
                placeholder="Ex.: Loja Modelo"
              />
            </label>

            <label className="ck-superadmin-field">
              <span>Modo de tema</span>
              <select
                value={modoTema}
                onChange={(event) => setModoTema(event.target.value as ModoTema)}
              >
                <option value="CLARO">Claro</option>
                <option value="ESCURO">Escuro</option>
                <option value="SISTEMA">Sistema</option>
              </select>
            </label>

            <label className="ck-superadmin-field">
              <span>Cor primária</span>
              <input
                value={corPrimaria}
                onChange={(event) => setCorPrimaria(event.target.value)}
                placeholder="#2563eb"
              />
            </label>

            <label className="ck-superadmin-field">
              <span>Cor secundária</span>
              <input
                value={corSecundaria}
                onChange={(event) => setCorSecundaria(event.target.value)}
                placeholder="#1d4ed8"
              />
            </label>

            <label className="ck-superadmin-field">
              <span>Cor terciária/texto</span>
              <input
                value={corTerciaria}
                onChange={(event) => setCorTerciaria(event.target.value)}
                placeholder="#111827"
              />
            </label>

            <label className="ck-superadmin-field ck-superadmin-field--wide">
              <span>URL do logo</span>
              <input
                value={urlLogo}
                onChange={(event) => setUrlLogo(event.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>
        </SuperAdminCard>
      ) : null}

      <div className="ck-superadmin-page__actions">
        <SuperAdminButton type="submit" variant="primary" disabled={Boolean(isSaving)}>
          {isSaving ? "Salvando..." : "Salvar locatário"}
        </SuperAdminButton>
      </div>
    </form>
  );
}
