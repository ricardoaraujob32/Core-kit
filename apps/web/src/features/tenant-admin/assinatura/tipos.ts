// apps/web/src/features/tenant-admin/assinatura/tipos.ts

export type ModuloAssinatura = {
  codigo: string;
  origem: string;
};

export type VincularModuloAssinaturaInput = {
  moduloId: string;
};

export type ListarMeusModulosAssinaturaResponse = {
  locatarioId: string;
  modulos: ModuloAssinatura[];
};

export type VinculoModuloAssinatura = {
  assinaturaId: string;
  moduloId: string;
  origem: string;
  gratuito: boolean;
  habilitadoEm: string;
  desabilitadoEm: string | null;
};

export type VincularModuloAssinaturaResponse = {
  item: VinculoModuloAssinatura;
};

export type DesvincularModuloAssinaturaResponse = {
  item: {
    assinaturaId: string;
    moduloId: string;
    desabilitadoEm: string;
  };
};