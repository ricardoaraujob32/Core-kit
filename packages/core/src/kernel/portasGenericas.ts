// packages/core/src/kernel/portasGenericas.ts

import type { ErroApp } from "./erros";
import { type Result } from "./result";

/**
 * Propósito do arquivo:
 * Define contratos (portas) genéricos do kernel que abstraem dependências externas,
 * permitindo desacoplamento entre domínio e infraestrutura.
 *
 * Essas interfaces seguem princípios de Clean Architecture,
 * sendo implementadas na camada de infra.
 */

/**
 * Porta abstrata para geração de identificadores.
 *
 * Esta interface desacopla o Core de bibliotecas ou estratégias concretas
 * de geração de IDs, permitindo uso de UUID, ULID ou outros mecanismos
 * sem dependência direta no domínio.
 */
export interface IdPorta {
  /**
   * Gera um novo identificador textual.
   *
   * @returns Identificador gerado pela implementação concreta.
   */
  gerarId(): string;
}

/**
 * Porta abstrata para acesso ao relógio do sistema.
 *
 * Permite controle determinístico de tempo em testes e evita acoplamento
 * direto do domínio a `new Date()`.
 */
export interface RelogioPorta {
  /**
   * Retorna o instante atual segundo a implementação concreta.
   *
   * @returns Data/hora corrente.
   */
  agora(): Date;
}

/**
 * Porta abstrata para operações de hash.
 *
 * Deve ser usada em cenários como senhas, tokens persistidos e outros
 * artefatos que exijam comparação segura entre valor bruto e hash.
 */
export interface HashPorta {
  /**
   * Gera hash para um texto em formato plano.
   *
   * @param textoPlano Valor bruto a ser transformado em hash.
   * @returns Hash textual produzido pela implementação.
   */
  gerarHash(textoPlano: string): Promise<string>;

  /**
   * Compara um valor em texto plano com um hash previamente gerado.
   *
   * @param textoPlano Valor bruto a validar.
   * @param hash Hash persistido usado na comparação.
   * @returns `true` quando o valor bruto corresponde ao hash informado.
   */
  comparar(textoPlano: string, hash: string): Promise<boolean>;
}

/**
 * Porta abstrata para assinatura e verificação de tokens.
 *
 * O domínio não deve depender diretamente de JWT ou biblioteca específica;
 * ele depende apenas deste contrato.
 */
export interface TokenPorta {
  /**
   * Assina um payload arbitrário e devolve o token serializado.
   *
   * @param payload Conteúdo a ser assinado.
   * @returns Token assinado em formato textual.
   */
  assinar(payload: Record<string, unknown>): Promise<string>;

  /**
   * Verifica um token textual e devolve seu payload decodificado.
   *
   * @param token Token recebido para validação.
   * @returns Payload decodificado e validado pela implementação.
   */
  verificar(token: string): Promise<Record<string, unknown>>;
}

/**
 * Porta transacional orientada a `Result`.
 *
 * Este contrato é mais alinhado ao padrão ROP do Core e deve ser preferido
 * quando a operação transacional já participa do fluxo `Result<T, ErroApp>`.
 */
export interface TransacaoPorta {
  /**
   * Executa uma função transacional que já retorna `Result`.
   *
   * @typeParam T Tipo de sucesso do resultado.
   * @param fn Função transacional orientada a `Result`.
   * @returns Resultado final preservando a semântica de sucesso ou erro.
   */
  executar<T>(fn: () => Promise<Result<T, ErroApp>>): Promise<Result<T, ErroApp>>;
}
