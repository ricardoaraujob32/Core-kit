// apps/web/src/features/tenant-admin/compras/pages/NovaCompraPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { FornecedorSelect } from "../../../../shared/domain-selects";
import { formatFornecedorLabel } from "../../../../shared/formatters";
import { PageSectionHeader } from "../../../../shared/layout/PageSectionHeader";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { comprasApi } from "../api/comprasApi";
import "../../cadastros/cadastros.css";
import "../../transacoes/pages/transacoes.css";

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
    <form className="ck-register-page" onSubmit={handleSubmit}>
      <PageSectionHeader
        kicker="Compras"
        title="Nova compra"
        description="Selecione o fornecedor por dados de domínio. A compra será criada e os itens serão adicionados na tela de detalhes."
        actions={
          <Link className="ck-register-action-secondary" to="/app/transacoes">
            Voltar
          </Link>
        }
      />

      {erro ? <div className="ck-register-alert">{erro}</div> : null}

      {erroFornecedores ? (
        <div className="ck-register-alert">
          Não foi possível carregar fornecedores: {erroFornecedores}
        </div>
      ) : null}

      <section className="ck-register-form-card">
        <div className="ck-register-form-header">
          <div className="ck-register-form-title">Fornecedor da compra</div>
          <p className="ck-register-form-desc">
            O ID fica oculto; o usuário escolhe pelo nome, documento ou contato.
          </p>
        </div>

        <div className="ck-register-form-body">
          <label className="ck-register-field">
            <span>Buscar fornecedor</span>
            <input
              className="ck-register-input"
              placeholder="Ex.: Distribuidora, CNPJ, e-mail ou telefone"
              value={buscaFornecedor}
              onChange={(event) => setBuscaFornecedor(event.target.value)}
            />
          </label>

          <label className="ck-register-field">
            <span>Fornecedor selecionado</span>
            <FornecedorSelect
              value={fornecedorId}
              fornecedores={fornecedoresFiltrados}
              disabled={isLoadingFornecedores}
              onChange={setFornecedorId}
            />
          </label>

          {fornecedorSelecionado ? (
            <div className="ck-selected-box">
              <div className="ck-selected-grid">
                <div>
                  <div className="ck-selected-label">Fornecedor</div>
                  <div className="ck-selected-value">
                    {formatFornecedorLabel(fornecedorSelecionado)}
                  </div>
                </div>

                <div>
                  <div className="ck-selected-label">Telefone</div>
                  <div className="ck-selected-value">
                    {fornecedorSelecionado.telefone ?? "—"}
                  </div>
                </div>

                <div>
                  <div className="ck-selected-label">E-mail</div>
                  <div className="ck-selected-value">
                    {fornecedorSelecionado.email ?? "—"}
                  </div>
                </div>

                <div>
                  <div className="ck-selected-label">Documento</div>
                  <div className="ck-selected-value">
                    {fornecedorSelecionado.documento ?? "—"}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="ck-register-form-card">
        <div className="ck-register-form-header">
          <div className="ck-register-form-title">Observação</div>
          <p className="ck-register-form-desc">
            Use para registrar contexto da compra ou reposição.
          </p>
        </div>

        <div className="ck-register-form-body">
          <label className="ck-register-field">
            <span>Observação da compra</span>
            <textarea
              className="ck-register-textarea"
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Ex.: reposição de estoque, compra de fornecedor, lote especial..."
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          className="ck-register-action-primary"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Criando..." : "Criar compra e adicionar itens"}
        </button>
      </div>
    </form>
  );
}
