// apps/web/src/features/tenant-admin/clientes/components/InlineClienteForm.tsx

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
import { clientesApi } from "../api/clientesApi";
import type { Cliente, CriarClienteInput } from "../tipos";

type InlineClienteFormProps = {
  onCreated: (cliente: Cliente) => void;
  onCancel?: () => void;
};

const INITIAL_FORM: CriarClienteInput = {
  nome: "",
  documento: "",
  email: "",
  telefone: "",
};

function limparTexto(value?: string | null): string | null {
  const texto = value?.trim() ?? "";
  return texto ? texto : null;
}

function completarClienteCriado(
  cliente: Cliente,
  form: CriarClienteInput,
): Cliente {
  return {
    ...cliente,
    nome: cliente.nome?.trim() || form.nome.trim(),
    documento:
      cliente.documento !== undefined
        ? cliente.documento
        : limparTexto(form.documento),
    email:
      cliente.email !== undefined ? cliente.email : limparTexto(form.email),
    telefone:
      cliente.telefone !== undefined
        ? cliente.telefone
        : limparTexto(form.telefone),
  };
}

function criarClienteOffline(form: CriarClienteInput): Cliente {
  const agora = new Date().toISOString();

  return {
    clienteId: createOfflineId("cliente"),
    nome: markOfflineLabel(form.nome.trim()),
    documento: limparTexto(form.documento),
    email: limparTexto(form.email),
    telefone: limparTexto(form.telefone),
    criadoEm: agora,
    atualizadoEm: agora,
  } as Cliente;
}

export function InlineClienteForm({
  onCreated,
  onCancel,
}: InlineClienteFormProps) {
  const { isOffline } = useOnlineStatus();
  const { enqueue } = useValidatedScopedOfflineEnqueue();

  const [form, setForm] = useState<CriarClienteInput>(INITIAL_FORM);
  const [erro, setErro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function patchForm(patch: Partial<CriarClienteInput>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErro("Informe o nome do cliente.");
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
        const clienteOffline = criarClienteOffline(form);

        const queued = enqueue({
          type: "clientes.criar",
          payload,
          localId: clienteOffline.clienteId,
        });

        if (!queued.ok) {
          setErro(queued.error);
          return;
        }

        setForm(INITIAL_FORM);
        onCreated(clienteOffline);
        return;
      }

      const response = await clientesApi.criar(payload);
      let clienteCriado = completarClienteCriado(response.item, form);

      try {
        const detalhe = await clientesApi.obter(clienteCriado.clienteId);
        clienteCriado = completarClienteCriado(detalhe.item, form);
      } catch {
        // Mantém o DTO completado com dados do formulário.
      }

      setForm(INITIAL_FORM);
      onCreated(clienteCriado);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <EntityCard
      title="Novo cliente"
      description={
        isOffline
          ? "Você está offline. O cliente será salvo como pendente e sincronizado depois."
          : "Cadastro rápido sem sair da venda."
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
            placeholder="Nome do cliente"
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
            placeholder="cliente@email.com"
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
              ? "Salvar cliente pendente"
              : "Salvar cliente"}
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
