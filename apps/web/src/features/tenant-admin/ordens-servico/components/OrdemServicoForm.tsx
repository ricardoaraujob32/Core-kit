// apps/web/src/features/tenant-admin/ordens-servico/components/OrdemServicoForm.tsx

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { ClienteSelect } from "../../../../shared/domain-selects";
import { formatClienteLabel } from "../../../../shared/formatters";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import type { CriarOrdemServicoInput } from "../tipos";

type Props = {
  onSubmit: (input: CriarOrdemServicoInput) => Promise<void>;
  initialValues?: Partial<CriarOrdemServicoInput>;
};

function textoBuscaCliente(cliente: Cliente): string {
  return [cliente.nome, cliente.documento, cliente.email, cliente.telefone]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function OrdemServicoForm({ onSubmit, initialValues }: Props) {
  const [titulo, setTitulo] = useState(initialValues?.titulo ?? "");
  const [clienteId, setClienteId] = useState(initialValues?.clienteId ?? "");
  const [descricao, setDescricao] = useState(initialValues?.descricao ?? "");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [erroClientes, setErroClientes] = useState<string | null>(null);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarClientes() {
      setCarregandoClientes(true);
      setErroClientes(null);

      try {
        const response = await clientesApi.listar();

        if (ativo) setClientes(response.itens);
      } catch (error) {
        if (ativo) setErroClientes(mapError(error).message);
      } finally {
        if (ativo) setCarregandoClientes(false);
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);

    try {
      await onSubmit({
        titulo: titulo.trim(),
        clienteId: clienteId || null,
        descricao: descricao.trim() || null,
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className="ck-register-form-card" onSubmit={handleSubmit}>
      <div className="ck-register-form-header">
        <div className="ck-register-form-title">Dados da OS</div>
        <p className="ck-register-form-desc">
          O cliente é escolhido por nome, documento ou contato. O ID fica oculto.
        </p>
      </div>

      <div className="ck-register-form-body">
        {erroClientes ? (
          <div className="ck-register-alert">
            Não foi possível carregar clientes: {erroClientes}
          </div>
        ) : null}

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
            disabled={carregandoClientes}
            emptyLabel={
              carregandoClientes ? "Carregando clientes..." : "OS sem cliente"
            }
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
            </div>
          </div>
        ) : null}

        <label className="ck-register-field">
          <span>Título da OS</span>
          <input
            className="ck-register-input"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            placeholder="Ex.: Formatação de notebook"
            required
            minLength={3}
          />
        </label>

        <label className="ck-register-field">
          <span>Descrição</span>
          <textarea
            className="ck-register-textarea"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="Descreva o problema, serviço combinado ou observações..."
          />
        </label>

        <div className="flex justify-end">
          <button
            className="ck-register-action-primary"
            type="submit"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar ordem de serviço"}
          </button>
        </div>
      </div>
    </form>
  );
}
