// apps/web/src/features/tenant-admin/ordens-servico/components/OrdemServicoForm.tsx

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { ClienteSelect } from "../../../../shared/domain-selects";
import { formatClienteLabel } from "../../../../shared/formatters";
import {
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityField,
  EntityForm,
  EntityFormGrid,
} from "../../shared/entity-ui";
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

        if (ativo) {
          setClientes(response.itens);
        }
      } catch (error) {
        if (ativo) {
          setErroClientes(mapError(error).message);
        }
      } finally {
        if (ativo) {
          setCarregandoClientes(false);
        }
      }
    }

    void carregarClientes();

    return () => {
      ativo = false;
    };
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termo = buscaCliente.trim().toLowerCase();

    if (!termo) {
      return clientes;
    }

    return clientes.filter((cliente) =>
      textoBuscaCliente(cliente).includes(termo),
    );
  }, [clientes, buscaCliente]);

  const clienteSelecionado = clientes.find(
    (cliente) => cliente.clienteId === clienteId,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    <EntityForm
      kicker="Ordens de serviço"
      title="Dados da OS"
      description="O cliente é escolhido por nome, documento ou contato. O ID fica oculto."
      onSubmit={handleSubmit}
      footer={
        <EntityButton type="submit" variant="primary" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar ordem de serviço"}
        </EntityButton>
      }
    >
      {erroClientes ? (
        <EntityAlert>
          Não foi possível carregar clientes: {erroClientes}
        </EntityAlert>
      ) : null}

      <EntityCard
        title="Cliente"
        description="Vincule a OS a um cliente ou deixe sem cliente se ainda não houver cadastro."
      >
        <EntityFormGrid>
          <EntityField label="Buscar cliente" wide>
            <input
              placeholder="Ex.: Maria, CPF/CNPJ, e-mail ou telefone"
              value={buscaCliente}
              onChange={(event) => setBuscaCliente(event.target.value)}
            />
          </EntityField>

          <EntityField label="Cliente selecionado" wide>
            <ClienteSelect
              value={clienteId}
              clientes={clientesFiltrados}
              disabled={carregandoClientes}
              emptyLabel={
                carregandoClientes ? "Carregando clientes..." : "OS sem cliente"
              }
              className=""
              onChange={setClienteId}
            />
          </EntityField>

          {clienteSelecionado ? (
            <div className="ck-entity-card ck-entity-field--wide">
              <div className="ck-entity-card__title">
                <h2>Cliente selecionado</h2>
                <p>{formatClienteLabel(clienteSelecionado)}</p>
              </div>

              <dl className="ck-entity-detail-list">
                <div>
                  <dt>Telefone</dt>
                  <dd>{clienteSelecionado.telefone ?? "—"}</dd>
                </div>

                <div>
                  <dt>E-mail</dt>
                  <dd>{clienteSelecionado.email ?? "—"}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </EntityFormGrid>
      </EntityCard>

      <EntityCard
        title="Serviço"
        description="Descreva o serviço solicitado, problema relatado ou combinação com o cliente."
      >
        <EntityFormGrid>
          <EntityField label="Título da OS" wide>
            <input
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex.: Formatação de notebook"
              required
              minLength={3}
            />
          </EntityField>

          <EntityField label="Descrição" wide>
            <textarea
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Descreva o problema, serviço combinado ou observações..."
              rows={5}
            />
          </EntityField>
        </EntityFormGrid>
      </EntityCard>
    </EntityForm>
  );
}
