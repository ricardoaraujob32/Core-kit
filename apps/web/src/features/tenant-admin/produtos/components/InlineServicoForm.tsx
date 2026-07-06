// apps/web/src/features/tenant-admin/produtos/components/InlineServicoForm.tsx

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
import { produtosApi } from "../api/produtosApi";
import type { CriarProdutoInput, Produto } from "../tipos";

type InlineServicoFormProps = {
  onCreated: (servico: Produto) => void;
  onCancel?: () => void;
};

const INITIAL_FORM: CriarProdutoInput = {
  nome: "",
  sku: "",
  descricao: "",
  unidade: "UN",
  tipo: "SERVICO",
  precoVenda: 0,
  custoReferencia: null,
  ativo: true,
};

function limparTexto(value?: string | null): string | null {
  const texto = value?.trim() ?? "";
  return texto ? texto : null;
}

function completarServicoCriado(
  servico: Produto,
  form: CriarProdutoInput,
): Produto {
  return {
    ...servico,
    nome: servico.nome?.trim() || form.nome.trim(),
    sku: servico.sku !== undefined ? servico.sku : limparTexto(form.sku),
    descricao:
      servico.descricao !== undefined
        ? servico.descricao
        : limparTexto(form.descricao),
    unidade: servico.unidade?.trim() || form.unidade?.trim() || "UN",
    tipo: "SERVICO",
    precoVenda:
      typeof servico.precoVenda === "number"
        ? servico.precoVenda
        : Number(form.precoVenda) || 0,
    custoReferencia:
      servico.custoReferencia !== undefined
        ? servico.custoReferencia
        : form.custoReferencia === null || form.custoReferencia === undefined
          ? null
          : Number(form.custoReferencia) || 0,
    ativo: servico.ativo ?? true,
  };
}

function criarServicoOffline(form: CriarProdutoInput): Produto {
  const agora = new Date().toISOString();

  return {
    produtoId: createOfflineId("servico"),
    nome: markOfflineLabel(form.nome.trim()),
    sku: limparTexto(form.sku),
    descricao: limparTexto(form.descricao),
    unidade: form.unidade?.trim() || "UN",
    tipo: "SERVICO",
    precoVenda: Number(form.precoVenda) || 0,
    custoReferencia:
      form.custoReferencia === null || form.custoReferencia === undefined
        ? null
        : Number(form.custoReferencia) || 0,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  } as Produto;
}

export function InlineServicoForm({
  onCreated,
  onCancel,
}: InlineServicoFormProps) {
  const { isOffline } = useOnlineStatus();
  const { enqueue } = useValidatedScopedOfflineEnqueue();

  const [form, setForm] = useState<CriarProdutoInput>(INITIAL_FORM);
  const [erro, setErro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function patchForm(patch: Partial<CriarProdutoInput>) {
    setForm((current) => ({
      ...current,
      ...patch,
      tipo: "SERVICO",
    }));
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErro("Informe o nome do serviço.");
      return;
    }

    setErro(null);
    setIsSaving(true);

    try {
      const payload = {
        nome: form.nome.trim(),
        sku: limparTexto(form.sku),
        descricao: limparTexto(form.descricao),
        unidade: form.unidade?.trim() || "UN",
        tipo: "SERVICO" as const,
        precoVenda: Number(form.precoVenda) || 0,
        custoReferencia:
          form.custoReferencia === null || form.custoReferencia === undefined
            ? null
            : Number(form.custoReferencia) || 0,
        ativo: true,
      };

      if (isOffline) {
        const servicoOffline = criarServicoOffline(form);

        const queued = enqueue({
          type: "servicos.criar",
          payload,
          localId: servicoOffline.produtoId,
        });

        if (!queued.ok) {
          setErro(queued.error);
          return;
        }

        setForm(INITIAL_FORM);
        onCreated(servicoOffline);
        return;
      }

      const response = await produtosApi.criar(payload);
      let servicoCriado = completarServicoCriado(response.item, form);

      try {
        const detalhe = await produtosApi.obter(servicoCriado.produtoId);
        servicoCriado = completarServicoCriado(detalhe.item, form);
      } catch {
        // Mantém o DTO completado com dados digitados.
      }

      setForm(INITIAL_FORM);
      onCreated(servicoCriado);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <EntityCard
      title="Novo serviço"
      description={
        isOffline
          ? "Você está offline. O serviço será salvo como pendente e sincronizado depois."
          : "Cadastro rápido de serviço para usar na ordem de serviço."
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
            placeholder="Ex.: Formatação de notebook"
          />
        </EntityField>

        <EntityField label="Código / SKU">
          <input
            value={form.sku ?? ""}
            disabled={isSaving}
            onChange={(event) => patchForm({ sku: event.target.value })}
            placeholder="Opcional"
          />
        </EntityField>

        <EntityField label="Unidade">
          <input
            value={form.unidade ?? "UN"}
            disabled={isSaving}
            onChange={(event) => patchForm({ unidade: event.target.value })}
            placeholder="UN"
          />
        </EntityField>

        <EntityField label="Preço de venda">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.precoVenda ?? 0}
            disabled={isSaving}
            onChange={(event) =>
              patchForm({ precoVenda: Number(event.target.value) })
            }
          />
        </EntityField>

        <EntityField label="Custo referência">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.custoReferencia ?? ""}
            disabled={isSaving}
            onChange={(event) =>
              patchForm({
                custoReferencia: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }
          />
        </EntityField>

        <EntityField label="Descrição" wide>
          <textarea
            value={form.descricao ?? ""}
            disabled={isSaving}
            rows={3}
            onChange={(event) => patchForm({ descricao: event.target.value })}
            placeholder="Descreva o serviço executado ou combinado."
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
              ? "Salvar serviço pendente"
              : "Salvar serviço"}
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
