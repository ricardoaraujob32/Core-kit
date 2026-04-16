// apps/web/src/features/superadmin/locatarios/tipos.ts

export type StatusLocatario =
  | "ATIVO"
  | "SUSPENSO"
  | "ENCERRADO"
  | "INATIVO";

export type ModoTema = "SISTEMA" | "CLARO" | "ESCURO";

export type Locatario = {
  locatarioId: string;
  nome: string;
  slug: string;
  email: string;
  documento?: string | null;
  fusoHorario?: string | null;
  status: StatusLocatario;
  motivoSuspensao?: string | null;
  motivoExclusao?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
  excluidoEm?: string | null;
};

export type ConfiguracaoLocatario = {
  configuracaoId: string;
  locatarioId: string;
  modoTema?: ModoTema;
  identidadeVisual: string;
  corPrimaria?: string | null;
  corSecundaria?: string | null;
  corTerciaria?: string | null;
  urlLogo?: string | null;
  ativa: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
};

export type CriarLocatarioInput = {
  nome: string;
  slug: string;
  email: string;
  documento?: string | null;
  fusoHorario?: string;
  configuracaoInicial: {
    modoTema?: ModoTema;
    identidadeVisual: string;
    corPrimaria?: string | null;
    corSecundaria?: string | null;
    corTerciaria?: string | null;
    urlLogo?: string | null;
    ativa: boolean;
  };
};

export type AtualizarLocatarioInput = {
  nome?: string;
  email?: string;
  documento?: string | null;
  fusoHorario?: string;
};

export type SuspenderLocatarioInput = {
  motivoSuspensao?: string | null;
};

export type ReativarLocatarioInput = {
  motivoReativacao?: string | null;
};

export type EncerrarLocatarioInput = {
  motivoExclusao?: string | null;
};

export type ListarLocatariosResponse = {
  itens: Locatario[];
};

export type ObterLocatarioResponse = {
  item: Locatario;
};

export type CriarLocatarioResponse = {
  item: {
    locatarioId: string;
  };
};

export type AtualizarLocatarioResponse = {
  item: Locatario;
};

export type AcaoLocatarioResponse = {
  item: Locatario;
};