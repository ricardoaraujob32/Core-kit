// apps/web/src/features/tenant-admin/transacoes/components/TransacaoItemForm.tsx

import { useState } from "react";
import { formatMoney } from "../../../../shared/formatters";
import {
  EntityActions,
  EntityButton,
  EntityField,
  EntityFormGrid,
} from "../../shared/entity-ui";
import { InlineProdutoForm } from "../../produtos/components/InlineProdutoForm";
import type { Produto } from "../../produtos/tipos";
import type { AdicionarItemTransacaoInput } from "../tipos";

function produtoLabel(produto: Produto): string {
  return `${produto.nome} • ${produto.tipo} • ${formatMoney(produto.precoVenda)}`;
}

type TransacaoItemFormProps = {
  produtos: Produto[];
  value: AdicionarItemTransacaoInput;
  disabled?: boolean;
  isSubmitting?: boolean;
  onChange: (value: AdicionarItemTransacaoInput) => void;
  onSubmit: () => Promise<void> | void;
  onProdutoCreated?: (produto: Produto) => void;
};

/**
 * Formulário independente para inclusão de itens na transação.
 *
 * Pensado para PWA:
 * - não conhece rota;
 * - não chama API diretamente;
 * - não depende de estado global;
 * - recebe dados e emite eventos por props;
 * - pode ser reaproveitado em tela online, fila offline ou modal.
 */
export function TransacaoItemForm({
  produtos,
  value,
  disabled = false,
  isSubmitting = false,
  onChange,
  onSubmit,
  onProdutoCreated,
}: TransacaoItemFormProps) {
  const [inlineProdutoAberto, setInlineProdutoAberto] = useState(false);
  function patchValue(patch: Partial<AdicionarItemTransacaoInput>) {
    onChange({
      ...value,
      ...patch,
    });
  }

  return (
    <>
      <EntityFormGrid>
        <EntityField label="Produto ou serviço" wide>
          {onProdutoCreated ? (
            <div className="ck-entity-actions-row">
              <EntityButton type="button" disabled={disabled || isSubmitting} onClick={() => setInlineProdutoAberto((value) => !value)}>
                {inlineProdutoAberto ? "Fechar cadastro" : "+ Novo produto/serviço"}
              </EntityButton>
            </div>
          ) : null}
          <select
            value={value.produtoId}
            disabled={disabled || isSubmitting}
            onChange={(event) =>
              patchValue({
                produtoId: event.target.value,
              })
            }
          >
            <option value="">Selecione um item</option>
            {produtos.map((produto) => (
              <option key={produto.produtoId} value={produto.produtoId}>
                {produtoLabel(produto)}
              </option>
            ))}
          </select>
        </EntityField>

        {inlineProdutoAberto && onProdutoCreated ? (
          <InlineProdutoForm
            onCreated={(produto) => {
              onProdutoCreated(produto);
              patchValue({ produtoId: produto.produtoId });
              setInlineProdutoAberto(false);
            }}
            onCancel={() => setInlineProdutoAberto(false)}
          />
        ) : null}

        <EntityField label="Quantidade">
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={value.quantidade}
            disabled={disabled || isSubmitting}
            onChange={(event) =>
              patchValue({
                quantidade: Number(event.target.value),
              })
            }
          />
        </EntityField>

        <EntityField label="Valor unitário">
          <input
            type="number"
            min="0"
            step="0.01"
            value={value.valorUnitario}
            disabled={disabled || isSubmitting}
            onChange={(event) =>
              patchValue({
                valorUnitario: Number(event.target.value),
              })
            }
          />
        </EntityField>

        <EntityField label="Desconto">
          <input
            type="number"
            min="0"
            step="0.01"
            value={value.valorDesconto ?? 0}
            disabled={disabled || isSubmitting}
            onChange={(event) =>
              patchValue({
                valorDesconto: Number(event.target.value),
              })
            }
          />
        </EntityField>
      </EntityFormGrid>

      <EntityActions>
        <EntityButton
          type="button"
          variant="primary"
          disabled={disabled || isSubmitting || produtos.length === 0}
          onClick={() => void onSubmit()}
        >
          {isSubmitting ? "Adicionando..." : "Adicionar item"}
        </EntityButton>
      </EntityActions>
    </>
  );
}
