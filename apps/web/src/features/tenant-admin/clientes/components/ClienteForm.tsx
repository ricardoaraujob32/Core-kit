// apps/web/src/features/tenant-admin/clientes/components/ClienteForm.tsx

import { useMemo, useState, type FormEvent } from "react";
import type {
  AtualizarClienteInput,
  Cliente,
  CriarClienteInput,
} from "../tipos";
import "../../shared/entityPages.css";

type Props = {
  mode: "create" | "edit";
  initialData?: Cliente | null;
  isSaving?: boolean;
  erro?: string | null;
  onSubmit: (
    input: CriarClienteInput | AtualizarClienteInput,
  ) => void | Promise<void>;
};

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function ClienteForm({
  mode,
  initialData,
  isSaving,
  erro,
  onSubmit,
}: Props) {
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [documento, setDocumento] = useState(initialData?.documento ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [telefone, setTelefone] = useState(initialData?.telefone ?? "");

  const titulo = useMemo(
    () => (mode === "create" ? "Novo cliente" : "Editar cliente"),
    [mode],
  );

  const subtitulo = useMemo(
    () =>
      mode === "create"
        ? "Cadastre os dados principais para vendas, atendimento e histórico."
        : "Atualize os dados de identificação e contato do cliente.",
    [mode],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      nome: nome.trim(),
      documento: normalizeOptionalText(documento),
      email: normalizeOptionalText(email),
      telefone: normalizeOptionalText(telefone),
    });
  }

  return (
    <form className="ck-entity-form" onSubmit={handleSubmit}>
      <header className="ck-entity-form__header">
        <div>
          <p className="ck-entity-kicker">Clientes</p>
          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
        </div>
      </header>

      {erro ? <div className="ck-entity-alert">{erro}</div> : null}

      <section className="ck-entity-card">
        <div className="ck-entity-card__title">
          <h2>Identificação</h2>
          <p>Dados usados para reconhecer o cliente no sistema.</p>
        </div>

        <div className="ck-entity-form-grid">
          <label className="ck-entity-field ck-entity-field--wide">
            <span>Nome</span>
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: João da Silva"
              required
            />
          </label>

          <label className="ck-entity-field">
            <span>Documento</span>
            <input
              value={documento}
              onChange={(event) => setDocumento(event.target.value)}
              placeholder="CPF/CNPJ ou outro identificador"
            />
          </label>
        </div>
      </section>

      <section className="ck-entity-card">
        <div className="ck-entity-card__title">
          <h2>Contato</h2>
          <p>Informações úteis para atendimento e relacionamento.</p>
        </div>

        <div className="ck-entity-form-grid">
          <label className="ck-entity-field">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="cliente@email.com"
            />
          </label>

          <label className="ck-entity-field">
            <span>Telefone</span>
            <input
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              placeholder="(00) 00000-0000"
            />
          </label>
        </div>
      </section>

      <footer className="ck-entity-form__footer">
        <button
          className="ck-entity-button ck-entity-button--primary"
          type="submit"
          disabled={Boolean(isSaving)}
        >
          {isSaving ? "Salvando..." : "Salvar cliente"}
        </button>
      </footer>
    </form>
  );
}
