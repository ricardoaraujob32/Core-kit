import { LocatarioId } from "../locatario";

export type AssinaturaId = string;
export type PlanoId = string;

export type StatusAssinatura = "ATIVA" | "SUSPENSA" | "CANCELADA" | "EXPIRADA";

export type Assinatura = {
  id: AssinaturaId;
  locatarioId: LocatarioId;
  planoId: PlanoId;

  status: StatusAssinatura;

  inicioEm: Date;
  fimEm: Date | null;
  renovacaoEm: Date | null;

  motivo: string | null;

  criadoEm: Date;
  atualizadoEm: Date;
  excluidoEm: Date | null;
};
