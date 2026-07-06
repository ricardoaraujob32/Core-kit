// apps/web/src/features/tenant-admin/transacoes/components/TransacaoItensSection.tsx

import {
  EntityAlert,
  EntityCard,
} from "../../shared/entity-ui";
import type { Produto } from "../../produtos/tipos";
import type {
  AdicionarItemTransacaoInput,
  AtualizarItemTransacaoInput,
  TransacaoItem,
} from "../tipos";
import { TransacaoItemForm } from "./TransacaoItemForm";
import { TransacaoItensTable } from "./TransacaoItensTable";

type TransacaoItensSectionProps = {
  itens: TransacaoItem[];
  produtos: Produto[];
  novoItem: AdicionarItemTransacaoInput;
  editavel: boolean;
  isRunning: boolean;
  erro?: string | null;
  onNovoItemChange: (value: AdicionarItemTransacaoInput) => void;
  onAdicionarItem: () => Promise<void> | void;
  onAtualizarItem: (
    itemId: string,
    input: AtualizarItemTransacaoInput,
  ) => Promise<void> | void;
  onRemoverItem: (itemId: string) => Promise<void> | void;
  onProdutoCreated: (produto: Produto) => void;
};

/**
 * Seção PWA-ready para itens de transação.
 *
 * A página continua orquestrando APIs.
 * Esta seção só compõe formulário + tabela.
 */
export function TransacaoItensSection({
  itens,
  produtos,
  novoItem,
  editavel,
  isRunning,
  erro,
  onNovoItemChange,
  onAdicionarItem,
  onAtualizarItem,
  onRemoverItem,
  onProdutoCreated,
}: TransacaoItensSectionProps) {
  return (
    <EntityCard
      title="Itens"
      description="Produtos e serviços vinculados à transação."
    >
      {erro ? <EntityAlert>{erro}</EntityAlert> : null}

      {editavel ? (
        <TransacaoItemForm
          produtos={produtos}
          value={novoItem}
          disabled={isRunning}
          isSubmitting={isRunning}
          onChange={onNovoItemChange}
          onSubmit={onAdicionarItem}
          onProdutoCreated={onProdutoCreated}
        />
      ) : (
        <p className="ck-entity-description">
          Itens só podem ser alterados enquanto a transação estiver em estado editável.
        </p>
      )}

      <TransacaoItensTable
        itens={itens}
        editavel={editavel}
        isRunning={isRunning}
        onSalvarItem={onAtualizarItem}
        onRemoverItem={onRemoverItem}
      />
    </EntityCard>
  );
}
