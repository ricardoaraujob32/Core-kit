// apps/web/src/features/superadmin/locatarios/pages/LocatariosListPage.tsx

import { useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { SuperAdminButton, SuperAdminCard, SuperAdminPage } from "../../shared";
import { locatariosApi } from "../api/locatariosApi";
import { LocatariosTable } from "../components/LocatariosTable";
import type { Locatario } from "../tipos";

export default function LocatariosListPage() {
  const [itens, setItens] = useState<Locatario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setIsLoading(true);
      setErro(null);

      try {
        const response = await locatariosApi.listar();

        if (ativo) {
          setItens(response.itens);
        }
      } catch (error) {
        if (ativo) {
          setErro(mapError(error).message);
        }
      } finally {
        if (ativo) {
          setIsLoading(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <SuperAdminPage
      kicker="Plataforma"
      title="Locatários"
      description="Gerencie empresas, tenants, usuários vinculados e configurações globais."
      actions={
        <SuperAdminButton to="/plataforma/locatarios/novo" variant="primary">
          Novo locatário
        </SuperAdminButton>
      }
    >
      {erro ? (
        <SuperAdminCard title="Erro ao carregar locatários">
          {erro}
        </SuperAdminCard>
      ) : null}

      {isLoading ? (
        <SuperAdminCard>
          Carregando locatários...
        </SuperAdminCard>
      ) : (
        <LocatariosTable itens={itens} />
      )}
    </SuperAdminPage>
  );
}
