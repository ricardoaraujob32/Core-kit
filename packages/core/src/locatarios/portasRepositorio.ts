// packages/core/src/locatarios/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel";
import type { ConfiguracaoLocatario, ConfiguracaoLocatarioId, Locatario, LocatarioId, LocatarioSlug, ModoTemaLocatario } from "./tipos";

/**
 * Porta de persistência do domínio de locatários.
 *
 * Esta interface abstrai o armazenamento e a recuperação de locatários,
 * permitindo que o Core manipule o agregado sem conhecer banco, ORM,
 * SQL ou qualquer detalhe de infraestrutura.
 */
export interface LocatariosRepositorio {
  /**
   * Persiste um novo locatário no repositório.
   *
   * @param params Dados necessários para criação do locatário.
   * @returns `Ok` com o identificador criado, ou `Err` em caso de falha.
   */
  criar(params: {
    locatarioId: LocatarioId;
    nome: string;
    slug: LocatarioSlug;
    documento: string | null;
    email: string;
    fusoHorario: string;
    status: "ATIVO";
    criadoEm: Date;
    atualizadoEm: Date;
    configuracaoInicial: {
      configuracaoId: ConfiguracaoLocatarioId;
      modoTema: ModoTemaLocatario;
      identidadeVisual: string;
      corPrimaria: string | null;
      corSecundaria: string | null;
      corTerciaria: string | null;
      urlLogo: string | null;
      ativa: boolean;
      criadoEm: Date;
      atualizadoEm: Date;
    };
  }): Promise<Result<{ locatarioId: LocatarioId }, ErroApp>>;

  /**
   * Busca um locatário por sua identidade lógica.
   *
   * @param params Identificador do locatário desejado.
   * @returns `Ok(locatario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(params: {locatarioId: LocatarioId}): Promise<Result<Locatario | null, ErroApp>>;

 /**
  * 
  * @param params 
  */
  buscarPorSlug(params: {
    slug: LocatarioSlug;
  }): Promise<Result<Locatario | null, ErroApp>>;

  /**
   * 
   * @param params 
   */
  buscarPorEmail(params: {
    emailNormalizado: string;
  }): Promise<Result<Locatario | null, ErroApp>>;


  /**
   * Lista todos os locatários visíveis ao contexto da implementação.
   *
   * @returns `Ok` com a coleção de locatários encontrados.
   */
  listar(): Promise<Result<Locatario[], ErroApp>>;

  /**
   * Atualiza integralmente o snapshot persistido do locatário.
   * Necessário para futuros casos de uso de transição de estado.
   *
   * @param locatario 
   * @returns
   */
  atualizar(locatario: Locatario): Promise<Result<Locatario, ErroApp>>;

  /**
   * Lista configurações do locatário.
   *
   * @param params 
   * @returns
   */
  listarConfiguracoes(params: {
    locatarioId: LocatarioId;
  }): Promise<Result<ConfiguracaoLocatario[], ErroApp>>;

  /**
   * Obtém a configuração ativa do locatário.
   * 
   * @param params
   * @returns
   */
  obterConfiguracaoAtiva(params: {
    locatarioId: LocatarioId;
  }): Promise<Result<ConfiguracaoLocatario | null, ErroApp>>;

  /**
   * 
   * @param params 
   * @returns
   */
  criarConfiguracao(params: {
    locatarioId: LocatarioId;
    configuracaoId: string;
    modoTema: ModoTemaLocatario;
    identidadeVisual: string;
    corPrimaria: string | null;
    corSecundaria: string | null;
    corTerciaria: string | null;
    urlLogo: string | null;
    ativa: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
  }): Promise<Result<{ configuracaoId: string }, ErroApp>>;

  /**
   * 
   * @param config 
   * @returns
   */
  atualizarConfiguracao(config: ConfiguracaoLocatario): Promise<Result<ConfiguracaoLocatario, ErroApp>>;

  /**
   * 
   * @param params 
   * @returns
   */
  buscarConfiguracaoPorId(params: {
    locatarioId: LocatarioId;
    configuracaoId: string;
  }): Promise<Result<ConfiguracaoLocatario | null, ErroApp>>;

  /**
   * 
   * @param params 
   * @returns
   */
  desativarConfiguracoesAtivas(params: {
    locatarioId: LocatarioId;
    atualizadoEm: Date;
  }): Promise<Result<void, ErroApp>>;
}
