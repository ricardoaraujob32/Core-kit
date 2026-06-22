// apps/web/src/features/tenant-admin/clientes/components/ClienteForm.tsx

import { useMemo, useState, type FormEvent } from "react";
import {
  EntityButton,
  EntityCard,
  EntityField,
  EntityForm,
  EntityFormGrid,
} from "../../shared/entity-ui";
import type {
  AtualizarClienteInput,
  Cliente,
  CriarClienteInput,
} from "../tipos";

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
    <EntityForm
      kicker="Clientes"
      title={titulo}
      description={subtitulo}
      error={erro}
      onSubmit={handleSubmit}
      footer={
        <EntityButton type="submit" variant="primary" disabled={Boolean(isSaving)}>
          {isSaving ? "Salvando..." : "Salvar cliente"}
        </EntityButton>
      }
    >
      <EntityCard
        title="Identificação"
        description="Dados usados para reconhecer o cliente no sistema."
      >
        <EntityFormGrid>
          <EntityField label="Nome" wide>
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: João da Silva"
              required
            />
          </EntityField>

          <EntityField label="Documento">
            <input
              value={documento}
              onChange={(event) => setDocumento(event.target.value)}
              placeholder="CPF/CNPJ ou outro identificador"
            />
          </EntityField>
        </EntityFormGrid>
      </EntityCard>

      <EntityCard
        title="Contato"
        description="Informações úteis para atendimento e relacionamento."
      >
        <EntityFormGrid>
          <EntityField label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="cliente@email.com"
            />
          </EntityField>

          <EntityField label="Telefone">
            <input
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              placeholder="(00) 00000-0000"
            />
          </EntityField>
        </EntityFormGrid>
      </EntityCard>
    </EntityForm>
  );
}
