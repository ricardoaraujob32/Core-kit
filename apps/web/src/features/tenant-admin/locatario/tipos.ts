// apps/web/src/features/tenant-admin/locatario/tipos.ts

export type StatusLocatario =
  | "ATIVO"
  | "SUSPENSO"
  | "ENCERRADO"
  | "INATIVO";

export type ModoTema = "SISTEMA" | "CLARO" | "ESCURO";

export type MeuLocatario = {
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

export type CriarConfiguracaoLocatarioInput = {
  modoTema?: ModoTema;
  identidadeVisual: string;
  corPrimaria?: string | null;
  corSecundaria?: string | null;
  corTerciaria?: string | null;
  urlLogo?: string | null;
  ativa: boolean;
};

export type AtualizarConfiguracaoLocatarioInput = {
  modoTema?: ModoTema;
  identidadeVisual?: string;
  corPrimaria?: string | null;
  corSecundaria?: string | null;
  corTerciaria?: string | null;
  urlLogo?: string | null;
};

export type ObterMeuLocatarioResponse = {
  item: MeuLocatario;
};

export type ListarConfiguracoesLocatarioResponse = {
  itens: ConfiguracaoLocatario[];
};

export type ObterConfiguracaoAtivaLocatarioResponse = {
  item: ConfiguracaoLocatario | null;
};

export type CriarConfiguracaoLocatarioResponse = {
  item: ConfiguracaoLocatario;
};

export type AtualizarConfiguracaoLocatarioResponse = {
  item: ConfiguracaoLocatario;
};

export type AtivarConfiguracaoLocatarioResponse = {
  item: ConfiguracaoLocatario;
};