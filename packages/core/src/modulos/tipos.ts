import { LocatarioId } from "../locatarios";

export type ModuloCodigo = string;

export type OrigemModuloHabilitado = "SISTEMA" | "PLANO" | "MANUAL";

export type ModuloHabilitado = {
  codigo: ModuloCodigo;
  origem: OrigemModuloHabilitado;
};

export type ListarModulosHabilitadosInput = {
  locatarioId: LocatarioId;
};

export type ListarModulosHabilitadosOutput = {
  locatarioId: LocatarioId;
  modulos: ModuloHabilitado[];
};

export type ModuloEstaHabilitadoInput = {
  locatarioId: LocatarioId;
  codigo: ModuloCodigo;
};

export type ModuloEstaHabilitadoOutput = {
  locatarioId: LocatarioId;
  codigo: ModuloCodigo;
  habilitado: boolean;
  origem?: OrigemModuloHabilitado;
};