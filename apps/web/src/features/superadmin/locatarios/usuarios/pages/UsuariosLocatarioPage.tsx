// apps/web/src/features/superadmin/locatarios/usuarios/pages/UsuariosLocatarioPage.tsx

import { useParams } from "react-router-dom";
import { SuperAdminButton, SuperAdminCard, SuperAdminDetailList, SuperAdminPage } from "../../../shared";
import { UsuariosLocatarioTable } from "../components/UsuariosLocatarioTable";

export default function UsuariosLocatarioPage() {
  const params = useParams<{ locatarioId: string }>();
  const locatarioId = params.locatarioId?.trim() ?? "";

  return (
    <SuperAdminPage
      kicker="Plataforma"
      title="Usuários do locatário"
      description="Tela preparada para integração com a API de usuários do locatário."
      actions={
        <>
          <SuperAdminButton to={`/plataforma/locatarios/${locatarioId}`}>
            Voltar ao locatário
          </SuperAdminButton>

          <SuperAdminButton
            to={`/plataforma/locatarios/${locatarioId}/usuarios/novo`}
            variant="primary"
          >
            Novo usuário
          </SuperAdminButton>
        </>
      }
    >
      <SuperAdminCard
        title="Contexto técnico"
        description="A integração com listar/criar usuários será conectada quando a API e os tipos estiverem consolidados."
      >
        <SuperAdminDetailList
          items={[
            {
              label: "ID técnico do locatário",
              value: locatarioId || "Não informado",
              technical: true,
            },
          ]}
        />
      </SuperAdminCard>

      <UsuariosLocatarioTable itens={[]} locatarioId={locatarioId} />
    </SuperAdminPage>
  );
}
