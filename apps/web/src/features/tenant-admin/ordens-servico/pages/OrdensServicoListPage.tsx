import { Link } from "react-router-dom";
import { OrdensServicoTable } from "../components/OrdensServicoTable";
import { useOrdensServico } from "../hooks/useOrdensServico";

export default function OrdensServicoListPage() {
  const { itens, loading, erro, recarregar } = useOrdensServico();

  return (
    <main>
      <header className="page-header">
        <div>
          <h1>Ordens de Serviço</h1>
          <p>Controle os serviços prestados e gere vendas ao concluir.</p>
        </div>
        <Link to="/app/ordens-servico/nova">Nova OS</Link>
      </header>

      {loading && <p>Carregando...</p>}
      {erro && <p role="alert">{erro}</p>}
      {!loading && !erro && <OrdensServicoTable itens={itens} />}
      <button type="button" onClick={recarregar}>Atualizar</button>
    </main>
  );
}
