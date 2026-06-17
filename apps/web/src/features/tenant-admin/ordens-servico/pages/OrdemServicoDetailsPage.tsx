import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ordensServicoApi } from "../api/ordensServicoApi";
import type { OrdemServico } from "../tipos";

export default function OrdemServicoDetailsPage() {
  const { ordemServicoId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<OrdemServico | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [valorTotal, setValorTotal] = useState("0");

  async function carregar() {
    if (!ordemServicoId) return;
    try {
      const response = await ordensServicoApi.obter(ordemServicoId);
      setItem(response.item);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar OS.");
    }
  }

  useEffect(() => { void carregar(); }, [ordemServicoId]);

  async function executar(acao: "iniciar" | "aguardar" | "concluir" | "cancelar") {
    if (!ordemServicoId) return;
    const response = await ordensServicoApi[acao](ordemServicoId);
    setItem(response.item);
  }

  async function gerarVenda() {
    if (!ordemServicoId) return;
    const response = await ordensServicoApi.gerarVenda(ordemServicoId, {
      valorTotal: Number(valorTotal),
      vencimentoEm: new Date().toISOString(),
    });
    setItem(response.item);
    navigate(`/app/transacoes/${response.transacaoId}`);
  }

  if (erro) return <main><p role="alert">{erro}</p></main>;
  if (!item) return <main><p>Carregando...</p></main>;

  return (
    <main>
      <p><Link to="/app/ordens-servico">Voltar</Link></p>
      <h1>{item.titulo}</h1>
      <p>Status: <strong>{item.status}</strong></p>
      <p>Cliente: {item.clienteId ?? "-"}</p>
      <p>{item.descricao ?? "Sem descrição."}</p>

      <section>
        <h2>Ações</h2>
        <button onClick={() => executar("iniciar")} disabled={item.status !== "ABERTA" && item.status !== "AGUARDANDO"}>Iniciar</button>
        <button onClick={() => executar("aguardar")} disabled={item.status !== "ABERTA" && item.status !== "EM_ANDAMENTO"}>Aguardar</button>
        <button onClick={() => executar("concluir")} disabled={item.status === "CONCLUIDA" || item.status === "CANCELADA"}>Concluir</button>
        <button onClick={() => executar("cancelar")} disabled={item.status === "CONCLUIDA" || item.status === "CANCELADA"}>Cancelar</button>
      </section>

      <section>
        <h2>Venda</h2>
        {item.transacaoId ? (
          <Link to={`/app/transacoes/${item.transacaoId}`}>Abrir venda gerada</Link>
        ) : (
          <div>
            <input value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} type="number" min="0" step="0.01" />
            <button onClick={gerarVenda} disabled={item.status !== "CONCLUIDA"}>Gerar venda</button>
          </div>
        )}
      </section>
    </main>
  );
}
