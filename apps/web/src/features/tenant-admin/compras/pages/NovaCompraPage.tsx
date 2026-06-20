// apps/web/src/features/tenant-admin/compras/pages/NovaCompraPage.tsx

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { formatFornecedorLabel } from "../../../../shared/formatters";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { comprasApi } from "../api/comprasApi";
import "../../shared/entityPages.css";

function textoBuscaFornecedor(fornecedor: Fornecedor): string {
  return [
    fornecedor.nome,
    fornecedor.documento,
    fornecedor.email,
    fornecedor.telefone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function NovaCompraPage() {
  const navigate = useNavigate();

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedorId, setFornecedorId] = useState("");
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erroFornecedores, setErroFornecedores] = useState<string | null>(null);
  const [isLoadingFornecedores, setIsLoadingFornecedores] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarFornecedores() {
      setIsLoadingFornecedores(true);
      setErroFornecedores(null);

      try {
        const response = await fornecedoresApi.listar();

        if (ativo) {
          setFornecedores(response.itens);
        }
      } catch (error) {
        if (ativo) {
          setErroFornecedores(mapError(error).message);
        }
      } finally {
        if (ativo) {
          setIsLoadingFornecedores(false);
        }
      }
    }

    void carregarFornecedores();

    return () => {
      ativo = false;
    };
  }, []);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = buscaFornecedor.trim().toLowerCase();

    if (!termo) {
      return fornecedores;
    }

    return fornecedores.filter((fornecedor) =>
      textoBuscaFornecedor(fornecedor).includes(termo),
    );
  }, [fornecedores, buscaFornecedor]);

  const fornecedorSelecionado = fornecedores.find(
    (fornecedor) => fornecedor.fornecedorId === fornecedorId,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await comprasApi.criar({
        fornecedorId: fornecedorId || null,
        observacao: normalizeOptionalText(observacao),
      });

      navigate(`/app/transacoes/${response.item.transacaoId}`);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="ck-entity-page">
      <div className="ck-entity-page__actions">
        <Link className="ck-entity-button" to="/app/transacoes">
          Voltar para transações
        </Link>
      </div>

      <form className="ck-entity-form" onSubmit={handleSubmit}>
        <header className="ck-entity-form__header">
          <div>
            <p className="ck-entity-kicker">Compras</p>
            <h1>Nova compra</h1>
            <p>
              Crie uma transação de compra e depois adicione os itens na tela de
              detalhes.
            </p>
          </div>
        </header>

        {erro ? <div className="ck-entity-alert">{erro}</div> : null}

        {erroFornecedores ? (
          <div className="ck-entity-alert">{erroFornecedores}</div>
        ) : null}

        <section className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Fornecedor</h2>
            <p>Selecione o fornecedor vinculado à compra.</p>
          </div>

          <div className="ck-entity-form-grid">
            <label className="ck-entity-field ck-entity-field--wide">
              <span>Buscar fornecedor</span>
              <input
                value={buscaFornecedor}
                onChange={(event) => setBuscaFornecedor(event.target.value)}
                placeholder="Nome, documento, e-mail ou telefone"
              />
            </label>

            <label className="ck-entity-field ck-entity-field--wide">
              <span>Fornecedor</span>
              <select
                value={fornecedorId}
                onChange={(event) => setFornecedorId(event.target.value)}
                disabled={isLoadingFornecedores}
              >
                <option value="">
                  {isLoadingFornecedores
                    ? "Carregando fornecedores..."
                    : "Compra sem fornecedor vinculado"}
                </option>

                {fornecedoresFiltrados.map((fornecedor) => (
                  <option
                    key={fornecedor.fornecedorId}
                    value={fornecedor.fornecedorId}
                  >
                    {formatFornecedorLabel(fornecedor)}
                  </option>
                ))}
              </select>
            </label>

            {fornecedorSelecionado ? (
              <div className="ck-entity-card ck-entity-field--wide">
                <div className="ck-entity-card__title">
                  <h2>Fornecedor selecionado</h2>
                  <p>{formatFornecedorLabel(fornecedorSelecionado)}</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Observação</h2>
            <p>Registre condições comerciais ou contexto da compra.</p>
          </div>

          <label className="ck-entity-field">
            <span>Observação da compra</span>
            <textarea
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Ex.: reposição de estoque, compra direta, fornecedor preferencial..."
              rows={5}
            />
          </label>
        </section>

        <footer className="ck-entity-form__footer">
          <button
            className="ck-entity-button ck-entity-button--primary"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Criando..." : "Criar compra"}
          </button>
        </footer>
      </form>
    </div>
  );
}
