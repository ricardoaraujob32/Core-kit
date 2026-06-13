// apps/web/src/features/tenant-admin/compras/pages/NovaCompraPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { comprasApi } from "../api/comprasApi";
import "../../transacoes/pages/transacoes.css";

function labelFornecedor(fornecedor: Fornecedor): string {
  return fornecedor.documento
    ? `${fornecedor.nome} — ${fornecedor.documento}`
    : fornecedor.nome;
}

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

        if (ativo) setFornecedores(response.itens);
      } catch (error) {
        if (ativo) setErroFornecedores(mapError(error).message);
      } finally {
        if (ativo) setIsLoadingFornecedores(false);
      }
    }

    void carregarFornecedores();

    return () => {
      ativo = false;
    };
  }, []);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = buscaFornecedor.trim().toLowerCase();

    if (!termo) return fornecedores;

    return fornecedores.filter((fornecedor) =>
      textoBuscaFornecedor(fornecedor).includes(termo),
    );
  }, [fornecedores, buscaFornecedor]);

  const fornecedorSelecionado = fornecedores.find(
    (fornecedor) => fornecedor.fornecedorId === fornecedorId,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await comprasApi.criar({
        fornecedorId: fornecedorId.trim() || null,
        observacao: observacao.trim() || null,
      });

      navigate(`/app/transacoes/${response.item.transacaoId}`);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="ck-page" onSubmit={handleSubmit}>
      <section className="ck-page-hero">
        <div className="ck-page-hero-inner">
          <div>
            <div className="ck-page-kicker">Compras</div>
            <h1 className="ck-page-title">Nova compra</h1>
            <p className="ck-page-description">
              Crie a compra e depois adicione os produtos na tela de detalhes.
            </p>
          </div>

          <div className="ck-page-actions">
            <Link className="ck-action-secondary" to="/app/transacoes">
              Voltar
            </Link>
          </div>
        </div>
      </section>

      {erro ? <div className="ck-alert">{erro}</div> : null}

      {erroFornecedores ? (
        <div className="ck-alert ck-alert-warning">
          Não foi possível carregar fornecedores: {erroFornecedores}
        </div>
      ) : null}

      <section className="ck-form-card">
        <div className="ck-form-card-header">
          <div className="ck-form-card-title">Fornecedor</div>
          <p className="ck-form-card-desc">
            Busque por nome, documento, e-mail ou telefone.
          </p>
        </div>

        <div className="ck-form-card-body">
          <label className="ck-field">
            <span>Buscar fornecedor</span>
            <input
              className="ck-input"
              placeholder="Ex.: Distribuidora, CNPJ, e-mail..."
              value={buscaFornecedor}
              onChange={(event) => setBuscaFornecedor(event.target.value)}
            />
          </label>

          <label className="ck-field">
            <span>Fornecedor selecionado</span>
            <select
              className="ck-select"
              value={fornecedorId}
              onChange={(event) => setFornecedorId(event.target.value)}
              disabled={isLoadingFornecedores}
            >
              <option value="">
                {isLoadingFornecedores
                  ? "Carregando fornecedores..."
                  : "Compra sem fornecedor"}
              </option>

              {fornecedoresFiltrados.map((fornecedor) => (
                <option
                  key={fornecedor.fornecedorId}
                  value={fornecedor.fornecedorId}
                >
                  {labelFornecedor(fornecedor)}
                </option>
              ))}
            </select>
          </label>

          {fornecedorSelecionado ? (
            <div className="ck-selected-box">
              <div className="ck-selected-grid">
                <div>
                  <div className="ck-selected-label">Nome</div>
                  <div className="ck-selected-value">{fornecedorSelecionado.nome}</div>
                </div>

                <div>
                  <div className="ck-selected-label">Documento</div>
                  <div className="ck-selected-value">{fornecedorSelecionado.documento ?? "—"}</div>
                </div>

                <div>
                  <div className="ck-selected-label">E-mail</div>
                  <div className="ck-selected-value">{fornecedorSelecionado.email ?? "—"}</div>
                </div>

                <div>
                  <div className="ck-selected-label">Telefone</div>
                  <div className="ck-selected-value">{fornecedorSelecionado.telefone ?? "—"}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="ck-form-card">
        <div className="ck-form-card-header">
          <div className="ck-form-card-title">Observação</div>
          <p className="ck-form-card-desc">
            Informação opcional para facilitar o histórico.
          </p>
        </div>

        <div className="ck-form-card-body">
          <label className="ck-field">
            <span>Observação da compra</span>
            <textarea
              className="ck-input ck-textarea"
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Ex.: reposição de estoque, compra de fornecedor, lote especial..."
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button className="ck-action-primary" disabled={isSaving} type="submit">
          {isSaving ? "Criando..." : "Criar compra e adicionar itens"}
        </button>
      </div>
    </form>
  );
}
