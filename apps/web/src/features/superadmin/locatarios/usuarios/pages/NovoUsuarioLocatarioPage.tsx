// apps/web/src/features/superadmin/locatarios/usuarios/pages/NovoUsuarioLocatarioPage.tsx

import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { SuperAdminButton, SuperAdminCard, SuperAdminPage } from "../../../shared";

export default function NovoUsuarioLocatarioPage() {
  const params = useParams<{ locatarioId: string }>();
  const locatarioId = params.locatarioId?.trim() ?? "";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <SuperAdminPage
      kicker="Plataforma"
      title="Novo usuário do locatário"
      description="Formulário visual preparado. A persistência será ligada quando a API de usuários estiver consolidada."
      actions={
        <SuperAdminButton to={`/plataforma/locatarios/${locatarioId}/usuarios`}>
          Voltar para usuários
        </SuperAdminButton>
      }
    >
      <form className="ck-superadmin-page" onSubmit={handleSubmit}>
        <SuperAdminCard
          title="Dados do usuário"
          description="Preencha os campos para validar o layout. A ação de salvar ainda está desabilitada nesta etapa."
        >
          <div className="ck-superadmin-form-grid">
            <label className="ck-superadmin-field ck-superadmin-field--wide">
              <span>Nome</span>
              <input
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Maria Silva"
              />
            </label>

            <label className="ck-superadmin-field">
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario@empresa.com"
              />
            </label>

            <label className="ck-superadmin-field">
              <span>Senha inicial</span>
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Senha temporária"
              />
            </label>
          </div>
        </SuperAdminCard>

        <div className="ck-superadmin-page__actions">
          <SuperAdminButton type="submit" variant="primary" disabled>
            Salvar indisponível nesta etapa
          </SuperAdminButton>
        </div>
      </form>
    </SuperAdminPage>
  );
}
