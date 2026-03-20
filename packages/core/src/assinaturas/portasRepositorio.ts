// packages/core/src/assinaturas/portasrepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { ModuloId } from "../modulos";
import { Assinatura, AssinaturaId, ListarModulosGratisResult, ModuloHabilitadoAssinatura, PlanoId, RegistrarAssinaturaParams,
   RegistrarModuloAssinaturaParams, ValidarModuloExistenteResult, ValidarPlanoAtivoResult } from "./tipos";

/**
 * 
 */
export interface AssinaturasRepositorio {
  criarAssinatura(params: RegistrarAssinaturaParams): Promise<Result<Assinatura, ErroApp>>;
  atualizarAssinatura(assinatura: Assinatura): Promise<Result<Assinatura, ErroApp>>;
  buscarPorId(assinaturaId: AssinaturaId): Promise<Result<Assinatura | null, ErroApp>>;
  buscarAssinaturaAtivaPorLocatario(locatarioId: LocatarioId): Promise<Result<Assinatura | null, ErroApp>>;
}

/**
 * 
 */
export interface AssinaturasModulosRepositorio {
  vincularModulo(params: RegistrarModuloAssinaturaParams): Promise<Result<ModuloHabilitadoAssinatura, ErroApp>>;
  desvincularModulo(assinaturaId: AssinaturaId, moduloId: ModuloId, desabilitadoEm: Date): Promise<Result<void, ErroApp>>;
  buscarModuloVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId): Promise<Result<ModuloHabilitadoAssinatura | null, ErroApp>>;
  listarModulosAtivosDaAssinatura(assinaturaId: AssinaturaId): Promise<Result<ModuloHabilitadoAssinatura[], ErroApp>>;
}

/**
 * 
 */
export interface PlanosConsultaRepositorio {
  validarPlanoAtivo(planoId: PlanoId): Promise<Result<ValidarPlanoAtivoResult | null, ErroApp>>;
}

/**
 * 
 */
export interface ModulosConsultaRepositorio {
  validarModuloAtivo(moduloId: ModuloId): Promise<Result<ValidarModuloExistenteResult | null, ErroApp>>;
  listarModulosGratis(): Promise<Result<ListarModulosGratisResult[], ErroApp>>;
}
