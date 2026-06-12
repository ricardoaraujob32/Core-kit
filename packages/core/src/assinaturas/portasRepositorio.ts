// packages/core/src/assinaturas/portasRepositorio.ts

import { ErroApp, Result } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import { ModuloId } from "../modulos/index.js";
import { Assinatura, AssinaturaId, ListarModulosGratisResult, ModuloHabilitadoAssinatura, PlanoId, RegistrarAssinaturaParams,
   RegistrarModuloAssinaturaParams, ValidarModuloExistenteResult, ValidarPlanoAtivoResult } from "./tipos.js";

/**
 * Porta de persistência das assinaturas.
 *
 * Esta interface abstrai criação, atualização e consulta de assinaturas
 * dentro do domínio comercial do sistema.
 */
export interface AssinaturasRepositorio {
  /**
   * Cria uma nova assinatura persistida.
   *
   * @param params Dados estruturados da assinatura.
   * @returns `Ok(assinatura)` com a entidade criada.
   */
  criarAssinatura(params: RegistrarAssinaturaParams): Promise<Result<Assinatura, ErroApp>>;

  /**
   * Atualiza integralmente uma assinatura persistida.
   *
   * @param assinatura Entidade de assinatura já validada pelo domínio.
   * @returns `Ok(assinaturaAtualizada)` quando a persistência é bem-sucedida.
   */
  atualizarAssinatura(assinatura: Assinatura): Promise<Result<Assinatura, ErroApp>>;

  /**
   * Busca uma assinatura por identificador.
   *
   * @param assinaturaId Identificador da assinatura.
   * @returns `Ok(assinatura | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(assinaturaId: AssinaturaId): Promise<Result<Assinatura | null, ErroApp>>;

  /**
   * Busca a assinatura ativa de um locatário.
   *
   * @param locatarioId Identificador do locatário.
   * @returns `Ok(assinatura | null)` quando a consulta é bem-sucedida.
   */
  buscarAssinaturaAtivaPorLocatario(locatarioId: LocatarioId): Promise<Result<Assinatura | null, ErroApp>>;
}

/**
 * Porta de persistência dos vínculos entre assinatura e módulos.
 *
 * Esta interface abstrai o relacionamento que habilita módulos
 * por assinatura no domínio comercial.
 */
export interface AssinaturasModulosRepositorio {
  /**
   * Vincula um módulo a uma assinatura.
   *
   * @param params Dados estruturados do vínculo.
   * @returns `Ok(vinculoCriado)` quando a operação é bem-sucedida.
   */
  vincularModulo(params: RegistrarModuloAssinaturaParams): Promise<Result<ModuloHabilitadoAssinatura, ErroApp>>;

  /**
   * Desvincula um módulo de uma assinatura.
   *
   * @param assinaturaId Assinatura alvo.
   * @param moduloId Módulo a ser desvinculado.
   * @param desabilitadoEm Instante de desabilitação do vínculo.
   * @returns `Ok(void)` quando a operação é concluída.
   */
  desvincularModulo(assinaturaId: AssinaturaId, moduloId: ModuloId, desabilitadoEm: Date): Promise<Result<void, ErroApp>>;

  /**
   * Busca um vínculo específico entre assinatura e módulo.
   *
   * @param assinaturaId Assinatura alvo.
   * @param moduloId Módulo consultado.
   * @returns `Ok(vinculo | null)` quando a consulta é bem-sucedida.
   */
  buscarModuloVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId): Promise<Result<ModuloHabilitadoAssinatura | null, ErroApp>>;

  /**
   * Lista módulos ativos vinculados à assinatura.
   *
   * @param assinaturaId Identificador da assinatura.
   * @returns `Ok` com os vínculos ativos encontrados.
   */
  listarModulosAtivosDaAssinatura(assinaturaId: AssinaturaId): Promise<Result<ModuloHabilitadoAssinatura[], ErroApp>>;
}

/**
 * Porta de consulta de planos.
 *
 * Esta interface tem perfil de leitura especializada e serve como fonte
 * de verdade para validação de planos ativos no domínio de assinaturas.
 */
export interface PlanosConsultaRepositorio {
  /**
   * Valida se um plano está ativo e disponível para uso.
   *
   * @param planoId Identificador do plano consultado.
   * @returns `Ok(planoOuNull)` quando a consulta é bem-sucedida.
   */
  validarPlanoAtivo(planoId: PlanoId): Promise<Result<ValidarPlanoAtivoResult | null, ErroApp>>;
}

/**
 * Porta de consulta de módulos para o domínio de assinaturas.
 *
 * Esta interface abstrai validação de módulo ativo e listagem de módulos
 * gratuitos usados nas regras comerciais.
 */
export interface ModulosConsultaRepositorio {
  /**
   * Valida se um módulo existe e está ativo.
   *
   * @param moduloId Identificador do módulo consultado.
   * @returns `Ok(moduloOuNull)` quando a consulta é bem-sucedida.
   */
  validarModuloAtivo(moduloId: ModuloId): Promise<Result<ValidarModuloExistenteResult | null, ErroApp>>;

  /**
   * Lista módulos gratuitos disponíveis.
   *
   * @returns `Ok` com a coleção de módulos gratuitos.
   */
  listarModulosGratis(): Promise<Result<ListarModulosGratisResult[], ErroApp>>;
}
