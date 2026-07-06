// apps/web/src/features/tenant-admin/fornecedores/components/InlineFornecedorForm.tsx

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import {
  createOfflineId,
  markOfflineLabel,
} from "../../../../shared/pwa/createOfflineEntity";
import { useValidatedScopedOfflineEnqueue } from "../../../../shared/pwa/useValidatedScopedOfflineEnqueue";
import { useOnlineStatus } from "../../../../shared/pwa/useOnlineStatus";
import {
  EntityActions,
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityField,
  EntityFormGrid,
} from "../../shared/entity-ui";
import { fornecedoresApi } from "../api/fornecedoresApi";
import type { CriarFornecedorInput, Fornecedor } from "../tipos";

type InlineFornecedorFormProps = {
  onCreated: (fornecedor: Fornecedor) => void;
  onCancel?: () => void;
};

const INITIAL_FORM: CriarFornecedorInput = {
  nome: "",
  documento: "",
  email: "",
  telefone: "",
};

function limparTexto(value?: string | null): string | null {
  const texto = value?.trim() ?? "";
  return texto ? texto : null;
}

function completarFornecedorCriado(
  fornecedor: Fornecedor,
  form: CriarFornecedorInput,
): Fornecedor {
  return {
    ...fornecedor,
    nome: fornecedor.nome?.trim() || form.nome.trim(),
    documento:
      fornecedor.documento !== undefined
        ? fornecedor.documento
        : limparTexto(form.documento),
    email:
      fornecedor.email !== undefined
        ? fornecedor.email
        : limparTexto(form.email),
    telefone:
      fornecedor.telefone !== undefined
        ? fornecedor.telefone
        : limparTexto(form.telefone),
  };
}

function criarFornecedorOffline(form: CriarFornecedorInput): Fornecedor {
  const agora = new Date().toISOString();

  return {
    fornecedorId: createOfflineId("fornecedor"),
    nome: markOfflineLabel(form.nome.trim()),
    documento: limparTexto(form.documento),
    email: limparTexto(form.email),
    telefone: limparTexto(form.telefone),
    criadoEm: agora,
    atualizadoEm: agora,
  } as Fornecedor;
}

export function InlineFornecedorForm({
  onCreated,
  onCancel,
}: InlineFornecedorFormProps) {
  const { isOffline } = useOnlineStatus();
  const { enqueue } = useValidatedScopedOfflineEnqueue();

  const [form, setForm] = useState<CriarFornecedorInput>(INITIAL_FORM);
  const [erro, setErro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function patchForm(patch: Partial<CriarFornecedorInput>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErro("Informe o nome do fornecedor.");
      return;
    }

    setErro(null);
    setIsSaving(true);

    try {
      const payload = {
        nome: form.nome.trim(),
        documento: limparTexto(form.documento),
        email: limparTexto(form.email),
        telefone: limparTexto(form.telefone),
      };

      if (isOffline) {
        const fornecedorOffline = criarFornecedorOffline(form);

        const queued = enqueue({
          type: "fornecedores.criar",
          payload,
          localId: fornecedorOffline.fornecedorId,
        });

        if (!queued.ok) {
          setErro(queued.error);
          return;
        }

        setForm(INITIAL_FORM);
        onCreated(fornecedorOffline);
        return;
      }

      const response = await fornecedoresApi.criar(payload);
      let fornecedorCriado = completarFornecedorCriado(response.item, form);

      try {
        const detalhe = await fornecedoresApi.obter(
          fornecedorCriado.fornecedorId,
        );
        fornecedorCriado = completarFornecedorCriado(detalhe.item, form);
      } catch {
        // Mantém o DTO completado com dados do formulário.
      }

      setForm(INITIAL_FORM);
      onCreated(fornecedorCriado);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <EntityCard
      title="Novo fornecedor"
      description={
        isOffline
          ? "Você está offline. O fornecedor será salvo como pendente e sincronizado depois."
          : "Cadastro rápido sem sair da compra."
      }
      className="ck-entity-field--wide"
    >
      {erro ? <EntityAlert>{erro}</EntityAlert> : null}

      <EntityFormGrid>
        <EntityField label="Nome" wide>
          <input
            value={form.nome}
            disabled={isSaving}
            onChange={(event) => patchForm({ nome: event.target.value })}
            placeholder="Nome do fornecedor"
          />
        </EntityField>

        <EntityField label="Documento">
          <input
            value={form.documento ?? ""}
            disabled={isSaving}
            onChange={(event) => patchForm({ documento: event.target.value })}
            placeholder="CPF/CNPJ"
          />
        </EntityField>

        <EntityField label="E-mail">
          <input
            value={form.email ?? ""}
            disabled={isSaving}
            onChange={(event) => patchForm({ email: event.target.value })}
            placeholder="fornecedor@email.com"
          />
        </EntityField>

        <EntityField label="Telefone">
          <input
            value={form.telefone ?? ""}
            disabled={isSaving}
            onChange={(event) => patchForm({ telefone: event.target.value })}
            placeholder="Telefone"
          />
        </EntityField>
      </EntityFormGrid>

      <EntityActions>
        <EntityButton
          type="button"
          variant="primary"
          disabled={isSaving}
          onClick={() => void salvar()}
        >
          {isSaving
            ? "Salvando..."
            : isOffline
              ? "Salvar fornecedor pendente"
              : "Salvar fornecedor"}
        </EntityButton>

        {onCancel ? (
          <EntityButton type="button" disabled={isSaving} onClick={onCancel}>
            Fechar
          </EntityButton>
        ) : null}
      </EntityActions>
    </EntityCard>
  );
}
