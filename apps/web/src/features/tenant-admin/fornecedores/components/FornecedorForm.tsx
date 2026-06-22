// apps/web/src/features/tenant-admin/fornecedores/components/FornecedorForm.tsx

import { useMemo, useState, type FormEvent } from "react";
import {
  EntityButton,
  EntityCard,
  EntityField,
  EntityForm,
  EntityFormGrid,
} from "../../shared/entity-ui";
import type {
  AtualizarFornecedorInput,
  CriarFornecedorInput,
  Fornecedor,
} from "../tipos";

type Props = {
  mode: "create" | "edit";
  initialData?: Fornecedor | null;
  isSaving?: boolean;
  erro?: string | null;
  onSubmit: (
    input: CriarFornecedorInput | AtualizarFornecedorInput,
  ) => void | Promise<void>;
};

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function FornecedorForm({
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
    () => (mode === "create" ? "Novo fornecedor" : "Editar fornecedor"),
    [mode],
  );

  const subtitulo = useMemo(
    () =>
      mode === "create"
        ? "Cadastre fornecedores para compras, custos e relacionamento comercial."
        : "Atualize os dados de identificação e contato do fornecedor.",
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
      kicker="Fornecedores"
      title={titulo}
      description={subtitulo}
      error={erro}
      onSubmit={handleSubmit}
      footer={
        <EntityButton type="submit" variant="primary" disabled={Boolean(isSaving)}>
          {isSaving ? "Salvando..." : "Salvar fornecedor"}
        </EntityButton>
      }
    >
      <EntityCard
        title="Identificação"
        description="Dados usados para reconhecer o fornecedor no sistema."
      >
        <EntityFormGrid>
          <EntityField label="Nome" wide>
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Distribuidora Modelo"
              required
            />
          </EntityField>

          <EntityField label="Documento">
            <input
              value={documento}
              onChange={(event) => setDocumento(event.target.value)}
              placeholder="CNPJ, CPF ou outro identificador"
            />
          </EntityField>
        </EntityFormGrid>
      </EntityCard>

      <EntityCard
        title="Contato"
        description="Informações úteis para cotações, compras e suporte."
      >
        <EntityFormGrid>
          <EntityField label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="fornecedor@email.com"
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
