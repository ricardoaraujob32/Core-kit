import { Link } from "react-router-dom";
import type { OrdemServico } from "../tipos";

export function OrdensServicoTable({ itens }: { itens: OrdemServico[] }) {
  if (itens.length === 0) return <p>Nenhuma ordem de serviço encontrada.</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Status</th>
          <th>Cliente</th>
          <th>Aberta em</th>
          <th>Venda</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {itens.map((item) => (
          <tr key={item.ordemServicoId}>
            <td>{item.titulo}</td>
            <td>{item.status}</td>
            <td>{item.clienteId ?? "-"}</td>
            <td>{new Date(item.abertaEm).toLocaleDateString("pt-BR")}</td>
            <td>{item.transacaoId ? "Gerada" : "-"}</td>
            <td><Link to={`/app/ordens-servico/${item.ordemServicoId}`}>Abrir</Link></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
