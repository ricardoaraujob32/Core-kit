// apps/web/src/features/tenant-admin/vendas/pages/NovaVendaPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { ClienteSelect } from "../../../../shared/domain-selects";
import { formatClienteLabel } from "../../../../shared/formatters";
import { PageSectionHeader } from "../../../../shared/layout/PageSectionHeader";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { vendasApi } from "../api/vendasApi";
import "../../cadastros/cadastros.css";
import "../../transacoes/pages/transacoes.css";

function textoBuscaCliente(cliente: Cliente): string {
  return [cliente.nome, cliente.documento, cliente.email, cliente.telefone]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function NovaVendaPage() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erroClientes, setErroClientes] = useState<string | null>(null);
  const [isLoadingClientes, setIsLoadingClientes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarClientes() {
      setIsLoadingClientes(true);
      setErroClientes(null);

      try {
        const response = await clientesApi.listar();

        if (ativo) setClientes(response.itens);
      } catch (error) {
        if (ativo) setErroClientes(mapError(error).message);
      } finally {
        if (ativo) setIsLoadingClientes(false);
      }
    }

    void carregarClientes();

    return () => {
      ativo = false;
    };
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termo = buscaCliente.trim().toLowerCase();

    if (!termo) return clientes;

    return clientes.filter((cliente) =>
      textoBuscaCliente(cliente).includes(termo),
    );
  }, [clientes, buscaCliente]);

  const clienteSelecionado = clientes.find(
    (cliente) => cliente.clienteId === clienteId,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await vendasApi.criar({
        clienteId: clienteId.trim() || null,
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
        kicker="Vendas"
        title="Nova venda"
        description="Selecione o cliente por dados de domínio. A venda será criada e os itens serão adicionados na tela de detalhes."
        actions={
          <Link className="ck-register-action-secondary" to="/app/transacoes">
            Voltar
          </Link>
        }
      />

      {erro ? <div className="ck-register-alert">{erro}</div> : null}

      {erroClientes ? (
        <div className="ck-register-alert">
          Não foi possível carregar clientes: {erroClientes}
        </div>
      ) : null}

      <section className="ck-register-form-card">
        <div className="ck-register-form-header">
          <div className="ck-register-form-title">Cliente da venda</div>
          <p className="ck-register-form-desc">
            O ID fica oculto; o usuário escolhe pelo nome, documento ou contato.
          </p>
        </div>

        <div className="ck-register-form-body">
          <label className="ck-register-field">
            <span>Buscar cliente</span>
            <input
              className="ck-register-input"
              placeholder="Ex.: Maria, CPF/CNPJ, e-mail ou telefone"
              value={buscaCliente}
              onChange={(event) => setBuscaCliente(event.target.value)}
            />
          </label>

          <label className="ck-register-field">
            <span>Cliente selecionado</span>
            <ClienteSelect
              value={clienteId}
              clientes={clientesFiltrados}
              disabled={isLoadingClientes}
              onChange={setClienteId}
            />
          </label>

          {clienteSelecionado ? (
            <div className="ck-selected-box">
              <div className="ck-selected-grid">
                <div>
                  <div className="ck-selected-label">Cliente</div>
                  <div className="ck-selected-value">
                    {formatClienteLabel(clienteSelecionado)}
                  </div>
                </div>

                <div>
                  <div className="ck-selected-label">Telefone</div>
                  <div className="ck-selected-value">
                    {clienteSelecionado.telefone ?? "—"}
                  </div>
                </div>

                <div>
                  <div className="ck-selected-label">E-mail</div>
                  <div className="ck-selected-value">
                    {clienteSelecionado.email ?? "—"}
                  </div>
                </div>

                <div>
                  <div className="ck-selected-label">Documento</div>
                  <div className="ck-selected-value">
                    {clienteSelecionado.documento ?? "—"}
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
            Use para registrar contexto comercial ou observações do pedido.
          </p>
        </div>

        <div className="ck-register-form-body">
          <label className="ck-register-field">
            <span>Observação da venda</span>
            <textarea
              className="ck-register-textarea"
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Ex.: venda balcão, pedido especial, condições combinadas..."
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
          {isSaving ? "Criando..." : "Criar venda e adicionar itens"}
        </button>
      </div>
    </form>
  );
}
