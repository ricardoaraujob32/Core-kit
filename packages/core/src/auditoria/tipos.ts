export type AuditoriaEvento = {
  eventoId: string;
  locatarioId: string | null; // null para eventos de plataforma
  usuarioId: string | null;
  acao: string; // ex: "login.sucesso", "login.falha"
  entidade?: string | null;
  entidadeId?: string | null;
  dados?: Record<string, unknown> | null;
  criadoEm: Date;
};