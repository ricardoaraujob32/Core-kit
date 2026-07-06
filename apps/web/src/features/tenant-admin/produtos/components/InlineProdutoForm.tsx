// apps/web/src/features/tenant-admin/produtos/components/InlineProdutoForm.tsx

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import {
  EntityActions,
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityField,
  EntityFormGrid,
} from "../../shared/entity-ui";
import { produtosApi } from "../api/produtosApi";
import type { CriarProdutoInput, Produto, TipoProduto } from "../tipos";

type InlineProdutoFormProps = {
  onCreated: (produto: Produto) => void;
  onCancel?: () => void;
};

const INITIAL_FORM: CriarProdutoInput = {
  nome: "",
  sku: "",
  descricao: "",
  unidade: "UN",
  tipo: "PRODUTO",
  precoVenda: 0,
  custoReferencia: null,
  ativo: true,
};

function limparTexto(value?: string | null): string | null {
  const texto = value?.trim() ?? "";
  return texto ? texto : null;
}

function completarProdutoCriado(
  produto: Produto,
  form: CriarProdutoInput,
): Produto {
  return {
    ...produto,
    nome: produto.nome?.trim() || form.nome.trim(),
    sku: produto.sku !== undefined ? produto.sku : limparTexto(form.sku),
    descricao:
      produto.descricao !== undefined
        ? produto.descricao
        : limparTexto(form.descricao),
    unidade: produto.unidade?.trim() || form.unidade?.trim() || "UN",
    tipo: produto.tipo ?? form.tipo,
    precoVenda:
      typeof produto.precoVenda === "number"
        ? produto.precoVenda
        : Number(form.precoVenda) || 0,
    custoReferencia:
      produto.custoReferencia !== undefined
        ? produto.custoReferencia
        : form.custoReferencia === null || form.custoReferencia === undefined
          ? null
          : Number(form.custoReferencia) || 0,
    ativo: produto.ativo ?? true,
  };
}

export function InlineProdutoForm({
  onCreated,
  onCancel,
}: InlineProdutoFormProps) {
  const [form, setForm] = useState<CriarProdutoInput>(INITIAL_FORM);
  const [erro, setErro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function patchForm(patch: Partial<CriarProdutoInput>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErro("Informe o nome do produto ou serviço.");
      return;
    }

    setErro(null);
    setIsSaving(true);

    try {
      const response = await produtosApi.criar({
        nome: form.nome.trim(),
        sku: limparTexto(form.sku),
        descricao: limparTexto(form.descricao),
        unidade: form.unidade?.trim() || "UN",
        tipo: form.tipo,
        precoVenda: Number(form.precoVenda) || 0,
        custoReferencia:
          form.custoReferencia === null || form.custoReferencia === undefined
            ? null
            : Number(form.custoReferencia) || 0,
        ativo: true,
      });

      let produtoCriado = completarProdutoCriado(response.item, form);

      try {
        const detalhe = await produtosApi.obter(produtoCriado.produtoId);
        produtoCriado = completarProdutoCriado(detalhe.item, form);
      } catch {
        // Mantém o DTO completado com os dados do formulário.
      }

      setForm(INITIAL_FORM);
      onCreated(produtoCriado);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <EntityCard
      title="Novo produto/serviço"
      description="Cadastro rápido para continuar lançando os itens da transação."
      className="ck-entity-field--wide"
    >
      {erro ? <EntityAlert>{erro}</EntityAlert> : null}

      <EntityFormGrid>
        <EntityField label="Nome" wide>
          <input
            value={form.nome}
            disabled={isSaving}
            onChange={(event) => patchForm({ nome: event.target.value })}
            placeholder="Nome do produto ou serviço"
          />
        </EntityField>

        <EntityField label="Tipo">
          <select
            value={form.tipo}
            disabled={isSaving}
            onChange={(event) =>
              patchForm({ tipo: event.target.value as TipoProduto })
            }
          >
            <option value="PRODUTO">Produto</option>
            <option value="SERVICO">Serviço</option>
          </select>
        </EntityField>

        <EntityField label="SKU / Código">
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
            placeholder="Opcional"
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
          {isSaving ? "Salvando..." : "Salvar produto/serviço"}
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
