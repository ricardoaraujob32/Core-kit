export type IdAssinatura = string;
export type IdLocatario = string;
export type IdPlano = string;

export type StatusAssinatura = "ATIVA" | "SUSPENSA" | "CANCELADA" | "EXPIRADA";

export type Assinatura = {
  id: IdAssinatura;
  locatarioId: IdLocatario;
  planoId: IdPlano;

  status: StatusAssinatura;

  inicioEm: Date;
  fimEm: Date | null;
  renovacaoEm: Date | null;

  motivo: string | null;

  criadoEm: Date;
  atualizadoEm: Date;
  excluidoEm: Date | null;
};
