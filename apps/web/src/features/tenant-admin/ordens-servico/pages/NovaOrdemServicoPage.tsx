import { useNavigate } from "react-router-dom";
import { ordensServicoApi } from "../api/ordensServicoApi";
import { OrdemServicoForm } from "../components/OrdemServicoForm";
import type { CriarOrdemServicoInput } from "../tipos";

export default function NovaOrdemServicoPage() {
  const navigate = useNavigate();

  async function criar(input: CriarOrdemServicoInput) {
    const response = await ordensServicoApi.criar(input);
    navigate(`/app/ordens-servico/${response.item.ordemServicoId}`);
  }

  return (
    <main>
      <h1>Nova Ordem de Serviço</h1>
      <OrdemServicoForm onSubmit={criar} />
    </main>
  );
}
